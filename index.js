/**
 * @param {import("probot").Application} app
 */
module.exports = app => {
  app.on("issues.opened", async context => {
    const issueComment = context.issue({ body: "Thanks for opening this issue!" })
    return context.github.issues.createComment(issueComment)
  })
}
