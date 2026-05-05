// 1. Security Check
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// 2. Fetch Works
async function loadWorks(){
    try {
        const res = await fetch("/api/getMyWork", {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const gallery = document.getElementById("workGallery");

        if (data.success && data.works.length > 0) {
            gallery.innerHTML = "";
            data.works.forEach(work => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <img src="${work.imageUrl}" alt="Student Artwork">
                    <button class="deleteBtn" onclick="deleteWork('${work._id}')">Delete Artwork</button>
                `;
                gallery.appendChild(card);
            });
        } else {
            gallery.innerHTML = '<div class="empty-state">No work uploaded yet. Show us your talent!</div>';
        }
    } catch (e) {
        console.error(e);
    }
}

// 3. Upload Work
async function uploadImage() {
    const fileInput = document.getElementById("imageInput");
    
    if (!fileInput.files[0]) {
        return alert("Please select an image first!");
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    try {
        // Notice: When using FormData, do NOT set 'Content-Type'. The browser does it automatically!
        const res = await fetch("/api/uploadWork", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        
        if (data.success) {
            alert("Masterpiece uploaded successfully!");
            fileInput.value = ""; // Clear the file input
            loadWorks(); // Refresh the gallery
        } else {
            alert("Upload failed.");
        }
    } catch (e) {
        console.error(e);
        alert("Connection error.");
    }
}

// 4. Delete Work
async function deleteWork(id) {
    if (!confirm("Are you sure you want to delete this artwork?")) return;

    try {
        const res = await fetch("/api/deleteWork/" + id, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (data.success) {
            loadWorks(); // Refresh the gallery
        }
    } catch (e) {
        console.error(e);
    }
}

// Initialize on page load
loadWorks();