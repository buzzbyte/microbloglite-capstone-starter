'use strict';

async function addPost(post, loggedInUser) {
    const postTmpl = document.querySelector("#ribbit-post");
    const postDiv = postTmpl.content.cloneNode(true).firstElementChild;
    postDiv.setAttribute("data-postid", post._id);

    if (post.username == loggedInUser.username) {
        postDiv.querySelector("#post-delete-btn").classList.remove("d-none");
    }

    const postTimestamp = new Date(post.createdAt);

    postDiv.querySelector("#post-author-fullname").textContent = post.username;
    getUserByUsername(post.username).then(author => {
        postDiv.querySelector("#post-author-fullname").textContent = author.fullName;
    });
    postDiv.querySelector("#post-author-fullname").href = `/user/?username=${post.username}`;
    postDiv.querySelector("#post-author-username").textContent = `@${post.username}`;
    postDiv.querySelector("#post-author-username").href = `/user/?username=${post.username}`;
    postDiv.querySelector("#post-timestamp").textContent = postTimestamp.toLocaleString();
    postDiv.querySelector("#post-content").innerHTML = formatPostText(post.text);
    
    const likeBtn   = postDiv.querySelector("#post-like-btn");
    const deleteBtn = postDiv.querySelector("#post-delete-btn");
    
    updateLikes(post, loggedInUser, postDiv);

    likeBtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        post = await getUpdatedPost(post);
        
        if (!isPostLikedByUser(post, loggedInUser)) {
            await likePost(post);
            updateLikes(post, loggedInUser);
            return;
        }
        await removeLike(getLikeByUser(post, loggedInUser));
        updateLikes(post, loggedInUser);
    });

    deleteBtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        if (post.username != loggedInUser.username) {
            return; // users can only delete their own posts
        }

        await deletePost(post._id);

        // hide it from view instead of refreshing everything
        document.querySelector(`.ribbit-post[data-postid="${post._id}"]`).classList.add("d-none");
    })

    // TODO: Add listeners for the Reribbit button

    twemoji.parse(postDiv);
    postTmpl.parentNode.appendChild(postDiv);
}

async function updateLikes(post, loggedInUser, postDiv=null) {
    post = await getUpdatedPost(post);

    // Dynamically update post when user interacts
    if (!postDiv) {
        postDiv = document.querySelector(`.ribbit-post[data-postid="${post._id}"]`);
        console.log(postDiv);
    }

    const likeBtn = postDiv.querySelector("#post-like-btn");

    bootstrap.Tooltip.getOrCreateInstance(likeBtn).hide();
    likeBtn.title = !isPostLikedByUser(post, loggedInUser) ? "Like this Ribbit" : "Unlike";

    postDiv.querySelector("#post-like-icon").className = (isPostLikedByUser(post, loggedInUser)
        ? "bi bi-heart-fill text-danger"
        : "bi bi-heart");
    
    if (post.likes.length > 0) {
        postDiv.querySelector("#post-likes-text").textContent = post.likes.length == 1 ? `${post.likes.length} Like` : `${post.likes.length} Likes`;
    } else {
        postDiv.querySelector("#post-likes-text").textContent = "Like";
    }

    updateTooltips();
}

function updateTooltips() {
    // Bootstrap Tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function isPostLikedByUser(post, user) {
    return Boolean(getLikeByUser(post, user)?.username == user.username);
}

function getLikeByUser(post, user) {
    return post.likes.find(e => e.username == user.username);
}

async function getUpdatedPost(post) {
    return getPostById(post._id);
}

function formatPostText(text) {
    // make newlines actually display
    text = text.replace(/(?:\r\n|\r|\n)/g, "<br>");

    // find and replace @username mentions to working links
    let userMentions = text.matchAll(/(?:^|\s)@([A-Za-z0-9._-]+)\b/gi);
    for (const userMention of userMentions) {
        text = text.replaceAll(userMention[0], `<a class="user-mention text-decoration-none" href="/user/?username=${userMention[1]}">${userMention[0]}</a>`);
    };

    // handle the dumb datauri posts that some other people did
    let dataUris = text.matchAll(/data:([\w/\-\.]+);(\w+),(.*)/ig);
    console.log(dataUris);
    for (const [dataUri, mimetype, encoding, data] of dataUris) {
        if (mimetype.startsWith("image/")) {
            text = text.replaceAll(dataUri, `<img src="${dataUri}" alt="image attachment">`);
        } else {
            text = text.replaceAll(dataUri, "[User tried to post an image, but failed. lol]");
        }
    }

    // make links clickable


    return text;
}

function clearPosts() {
    document.querySelectorAll(".ribbit-post").forEach((e) => e.remove());
}