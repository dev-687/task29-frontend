import React, { useState } from 'react'
import axios from "axios";

export default function Form() {
    const [videoFile, setVideoFile] = useState(null)
    const [videoUrl, setVideoUrl] = useState("");
    const handleFileChange = (e) => {
        e.preventDefault();
        setVideoFile(e.target.files[0]);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            alert("Please select a video file.");
            return;
        }
        const formData = new FormData();
        formData.append("video", videoFile);
        try {
            const response = await axios.post("http://localhost:5000/api/uploads", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setVideoUrl(response.data.videoUrl);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed!");
        }
    }
    return (
        <div className="flex flex-col items-center space-y-4">
            <form onSubmit={handleSubmit} className="flex">
                <input type="file" accept="video/*" onChange={handleFileChange} />
                <button type="submit" className="rounded-r-lg px-3 py-1 bg-gradient-to-r from-blue-500 to-green-500 text-white shrink-0">
                    Upload
                </button>
            </form>

            {videoUrl && (
                <video width="640" height="360" controls>
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    )
}
