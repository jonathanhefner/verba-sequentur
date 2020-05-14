/**
 * @param {import("probot").Application} app
 */
module.exports = app => {
  app.on("issues.labeled", async context => {
    const label = context.payload.label.name
    const issueComment = context.issue({ body: label })
    return context.github.issues.createComment(issueComment)
  })
}
