'use strict';

document.addEventListener('DOMContentLoaded', async function() {    
    // get everything here so we dont have to keep refetching
    const loggedInUser = getLoginData(),
          queryParams  = getQueryParams();
    const postForm = document.querySelector("#post-form");
    
    try {
        const profileUser = await getUserByUsername(queryParams?.username || loggedInUser.username);

        postForm.elements.postBtn.addEventListener('click', async (ev) => {
            const postText = postForm.elements.text;
            if (postText.value.trim() == "") {
                return;
            }

            await createPost(postText.value);
    
            // reset textarea and reload posts
            postText.value = "";
            clearPosts();
            loadPosts(profileUser).then(updateNumPosts);

            // clear validation
            postForm.classList.remove('was-validated');
        });
        
        try {
            loadInfo(profileUser);
            var userPosts = await loadPosts(profileUser);
            updateNumPosts(userPosts); 
        } catch (error) {
            throw error // lol
        }
    } catch (error) {
        window.location.replace("/user");
    }

    function updateNumPosts(userPosts) {
        return document.querySelector("#num-posts").textContent = userPosts.length;   
    }
    
    async function loadInfo(profileUser) {
        updateVisibility(profileUser);

        document.querySelector("#user-fullname").textContent = profileUser.fullName;
        document.querySelector("#username").textContent      = `@${profileUser.username}`;
        document.querySelector("#user-bio").textContent      = profileUser.bio;
    }
    
    async function loadPosts(profileUser) {
        userPosts = await getPosts(profileUser.username);
    
        // sort from newest to oldest
        // userPosts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
        // userPosts.forEach((post) => addPost(post, loggedInUser));
        for (const post of userPosts) {
            await addPost(post, loggedInUser);
        }

        return userPosts;
    }

    function updateVisibility(profileUser) {
        if (profileUser.username != loggedInUser.username) {
            document.querySelectorAll(".edit-profile-btn").forEach(e => e.classList.add("d-none"));
            document.querySelector("#post-form").classList.add("d-none");
            return;
        }
        document.querySelectorAll(".edit-profile-btn").forEach(e => e.classList.remove("d-none"));
        document.querySelector("#post-form").classList.remove("d-none");
        return;
    }
});