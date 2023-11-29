import Comment from './../components/Comment.js';
import CommentContainer from "../components/CommentContainer.js";
import VoteManager from "../components/VoteManager.js";

(async () => {
    const someAPIURL = "http://localhost:3000/schedules/6564c9c36ecdcf46af8a506b";
    const commentsComp = await CommentContainer.load(someAPIURL);
    const votesComp = await VoteManager.load(someAPIURL);
    console.log(commentsComp);
    document.querySelector("#root").append(votesComp.render(), commentsComp.render());
})();