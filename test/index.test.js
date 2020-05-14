const nock = require("nock")
const fs = require("fs")
const path = require("path")
const { Probot } = require("probot")
const appFn = require("..")
const payload = require("./fixtures/issues.opened")
const issueCreatedBody = { body: "Thanks for opening this issue!" }

describe("verba-sequentur", () => {
  let probot
  let mockCert

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, "fixtures/mock-cert.pem"), (err, cert) => {
      if (err) return done(err)
      mockCert = cert
      done()
    })
  })

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({ id: 123, cert: mockCert })
    probot.load(appFn)
  })

  test("creates a comment when an issue is opened", async () => {
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })

    nock("https://api.github.com")
      .post("/repos/jonathanhefner/testing-things/issues/1/comments", (body) => {
        expect(body).toMatchObject(issueCreatedBody)
        return true
      })
      .reply(200)

    await probot.receive({ name: "issues", payload })
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
