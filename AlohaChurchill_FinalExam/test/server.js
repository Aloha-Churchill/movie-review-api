let server = require("../server");
let chai = require("chai");
let chaiHttp = require("chai-http");
const { AssertionError } = require("chai");
chai.should();
chai.use(chaiHttp); 
const { expect } = chai;
var assert = chai.assert;

console.log("um");

describe("Server!", () => {
    it("Gets movies", done => {
      chai
        .request(server)
        .get("/get_movies")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.search_term).to.be.not.empty;
          done();
        });
    });

    it("Checks reviews", done => {
      chai
        .request(server)
        .post("/reviews")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('movie_title_input');
          expect(res.body).to.have.property('reviews_input');
          done();
        });
    });
    
  });