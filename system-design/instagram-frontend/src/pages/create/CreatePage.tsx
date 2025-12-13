import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Upload } from 'lucide-react';
import { createPost } from '../../api/posts';
import { Button } from '../../components/ui/Button';

export default function CreatePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            // Reset input value to allow selecting the same file again if needed
            e.target.value = '';
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('caption', caption);

            await createPost(formData);

            navigate('/');
        } catch (error) {
            console.error('Upload failed:', error);
            // Even if it fails (which it shouldn't in mock), we might want to let them pass for now
            // But with mock, it won't fail.
            alert('Failed to upload post');
        } finally {
            setIsUploading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-[600px] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden min-h-[400px]">
            <div className="border-b border-gray-200 p-3 text-center font-semibold flex justify-between items-center">
                <button
                    onClick={selectedFile ? clearSelection : () => navigate(-1)}
                    className="text-red-500 font-normal" // Changed from text-error or similar custom functionality
                    disabled={isUploading}
                >
                    {selectedFile ? 'Back' : 'Cancel'}
                </button>
                <span>Create new post</span>
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="text-primary font-bold disabled:opacity-50"
                >
                    {isUploading ? 'Sharing...' : 'Share'}
                </button>
            </div>

            <div className="p-0 h-[500px] flex flex-col md:flex-row">
                {!selectedFile ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
                        <div className="relative">
                            <Image className="w-24 h-24 text-gray-300" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Upload className="w-12 h-12 text-gray-500" />
                            </div>
                        </div>
                        <p className="text-xl font-light">Drag photos and videos here</p>
                        <Button type="button" onClick={() => fileInputRef.current?.click()}>
                            Select from computer
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    <>
                        <div className="w-full md:w-[60%] bg-black flex items-center justify-center">
                            {previewUrl && (
                                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                            )}
                        </div>
                        <div className="w-full md:w-[40%] border-l border-gray-200 p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                                <span className="font-semibold text-sm">Your Username</span>
                            </div>
                            <textarea
                                className="w-full h-[150px] resize-none outline-none text-sm placeholder-gray-400"
                                placeholder="Write a caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                maxLength={2200}
                            />
                            <div className="flex justify-between text-xs text-gray-400 border-t pt-2">
                                <span>😊</span>
                                <span>{caption.length}/2,200</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
