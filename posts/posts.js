'use strict';

document.addEventListener('DOMContentLoaded', async function() {    
    const loggedInUser = getLoginData();

    const postForm = document.querySelector("#post-form");
    const postTextarea = postForm.elements.text;
    const postBtn = postForm.elements.postBtn;

    const showMoreBtn = document.querySelector("#show-more");

    let currentPage = 1;

    loadPosts(currentPage);

    async function loadPosts(page) {
        const userPosts = await getPosts({page});

        console.log(userPosts);
    
        // sort from newest to oldest
        //userPosts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
        // userPosts.forEach((post) => addPost(post, loggedInUser));
        for (const post of userPosts) {
            await addPost(post, loggedInUser);
        }
    }

    showMoreBtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        currentPage++;
        loadPosts(currentPage);
    });

    postBtn.addEventListener('click', async (ev) => {
        if (postTextarea.value.trim() === "") {
            return;
        }

        await createPost(postTextarea.value);

        // reset textarea and reload posts
        postTextarea.value = "";
        clearPosts();
        loadPosts();

        // clear validation
        postForm.classList.remove('was-validated');
    });
});
