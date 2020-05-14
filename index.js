/**
 * @param {import("probot").Application} app
 */
module.exports = app => {
  app.on(["issues.labeled", "pull_request.labeled"], async context => {
    const label = context.payload.label.name
    const comment = context.issue({ body: label })
    return context.github.issues.createComment(comment)
  })
}
