/**
 * @param {import("probot").Application} app
 */
module.exports = app => {
  app.on(["issues.labeled", "pull_request.labeled"], async context => {
    const config = await context.config("verba-sequentur.yml", {})
    const label = context.payload.label.name
    const cannedResponse = config[label]
    if (cannedResponse) {
      const comment = context.issue({ body: cannedResponse.comment })
      return context.github.issues.createComment(comment)
    }
  })
}
