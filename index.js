/**
 * @param {import("probot").Application} app
 */
module.exports = app => {
  app.on(["issues.labeled", "pull_request.labeled"], async context => {
    const config = await context.config("verba-sequentur.yml", {})
    const label = context.payload.label.name
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
