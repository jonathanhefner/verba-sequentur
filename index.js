/**
 * @param {import("probot").Application} app
 */
module.exports = app => {
  app.on(["issues.labeled", "pull_request.labeled"], async context => {
    const issue = context.payload.issue || context.payload.pull_request
    if (issue.state == "closed" || issue.locked) {
      return
    }

    const label = context.payload.label.name

    const listEvents = context.github.issues.listEvents.endpoint.merge(context.issue())
    for await (const { data: page } of context.github.paginate.iterator(listEvents)) {
      if (page.some(item => item.event == "unlabeled" && item.label.name == label)) {
        return
      }
    }

    const config = await context.config("verba-sequentur.yml", {})
    const cannedResponse = config[label]

    if (cannedResponse && cannedResponse.comment) {
      const comment = context.issue({ body: cannedResponse.comment })
      await context.github.issues.createComment(comment)
    }

    if (cannedResponse && cannedResponse.close) {
      const close = context.issue({ state: "closed" })
      return context.github.issues.update(close)
    }
  })
}
