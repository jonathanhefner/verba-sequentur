/**
 * @param {import("probot").Application} app
 */
module.exports = app => {
  app.on(["issues.labeled", "pull_request.labeled"], async context => {
    const label = context.payload.label.name
    const log = context.log.child(context.issue({ label }))

    const issue = context.payload.issue || context.payload.pull_request
    if (issue.state == "closed" || issue.locked) {
      log("Ignoring closed / locked issue")
      return
    }

    const listEvents = context.github.issues.listEvents.endpoint.merge(context.issue())
    for await (const { data: page } of context.github.paginate.iterator(listEvents)) {
      if (page.some(item => item.event == "unlabeled" && item.label.name == label)) {
        log("Ignoring re-application of label")
        return
      }
    }

    const config = await context.config("verba-sequentur.yml", {})
    const cannedResponse = config[label]

    if (!cannedResponse) {
      log("No response configured for label")
      return
    }

    if (Object.keys(cannedResponse).some(key => key != "comment" && key != "close")) {
      log.warn("Unrecognized configuration label")
    }

    if (cannedResponse.comment) {
      log("Creating comment")
      const comment = context.issue({ body: cannedResponse.comment })
      await context.github.issues.createComment(comment)
    }

    if (cannedResponse.close) {
      log("Closing issue")
      const close = context.issue({ state: "closed" })
      return context.github.issues.update(close)
    }
  })
}
