import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, UploadCloud, RefreshCw, Wand2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api, { PostPreviewResponse } from "@/services/api";

const CreatePost = () => {
    const { session } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Optional Inputs
    const [niche, setNiche] = useState("");
    const [tone, setTone] = useState("");
    const [goal, setGoal] = useState("");
    const [cta, setCta] = useState("");
    const [autoPost, setAutoPost] = useState(false);

    // Result
    const [generatedPost, setGeneratedPost] = useState<PostPreviewResponse | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            // Reset generated post when new image is selected
            setGeneratedPost(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setGeneratedPost(null);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) {
            toast.error("Please upload an image first.");
            return;
        }

        if (!session?.access_token) {
            toast.error("You must be logged in.");
            return;
        }

        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append("image", selectedFile);
            if (niche) formData.append("niche", niche);
            if (tone) formData.append("tone", tone);
            if (goal) formData.append("goal", goal);
            if (cta) formData.append("cta", cta);
            formData.append("auto_post", autoPost.toString());

            const response = await api.generatePost(session.access_token, formData);
            setGeneratedPost(response);
            toast.success("Caption generated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate post. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Mock submission for now
    const [isPublishing, setIsPublishing] = useState(false);

    const handleSubmitPost = async () => {
        if (!generatedPost || !session?.access_token) return;

        setIsPublishing(true);
        try {
            // Use the PUBLIC URL returned by the backend (optimized_image_path should be a URL)
            // Note: In development, localhost might not work with FB Graph API unless tunneled. 
            // For now, we assume the backend returns a usable URL or we rely on the user testing in an env where it works.
            // If optimized_image_path is a local path, we might need to convert it to a serve-able URL.
            // Assuming the backend returns a relative path like "uploads/optimized/..." and we prepend base URL.

            // For this implementation, we assume `optimized_image_path` needs to be fully qualified if it isn't already.
            const imageUrl = generatedPost.optimized_image_path.startsWith('http')
                ? generatedPost.optimized_image_path
                : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${generatedPost.optimized_image_path}`;

            await api.publishToInstagram(session.access_token, {
                image_url: imageUrl,
                caption: generatedPost.caption
            });

            toast.success("Posted successfully to Instagram!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to publish to Instagram");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted flex">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Create New Post</h1>
                            <p className="text-muted-foreground mt-1">Upload an image and let AI craft the perfect caption.</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column: Inputs */}
                        <div className="space-y-6">
                            {/* Image Upload */}
                            <Card
                                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${previewUrl ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50"
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("file-upload")?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {previewUrl ? (
                                    <div className="relative aspect-[4/5] max-h-[400px] mx-auto overflow-hidden rounded-lg shadow-md">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4" /> Change Image
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <UploadCloud className="h-8 w-8 text-foreground/50" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">Click or Drop Image Here</p>
                                        <p className="text-sm mt-1">Supports JPG, PNG (Max 10MB)</p>
                                    </div>
                                )}
                            </Card>

                            {/* Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Niche (Optional)</Label>
                                    <Select value={niche} onValueChange={setNiche}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Niche" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Tech & Coding">👨‍💻 Tech & Coding</SelectItem>
                                            <SelectItem value="Fitness & Health">💪 Fitness & Health</SelectItem>
                                            <SelectItem value="Business & Finance">💼 Business & Finance</SelectItem>
                                            <SelectItem value="Travel & Lifestyle">✈️ Travel & Lifestyle</SelectItem>
                                            <SelectItem value="Food & Cooking">🍳 Food & Cooking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tone (Optional)</Label>
                                    <Select value={tone} onValueChange={setTone}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Tone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Professional">👔 Professional</SelectItem>
                                            <SelectItem value="Funny & Witty">😂 Funny & Witty</SelectItem>
                                            <SelectItem value="Bold & Controversial">🔥 Bold</SelectItem>
                                            <SelectItem value="Educational">📚 Educational</SelectItem>
                                            <SelectItem value="Casual & Friendly">👋 Casual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Goal (Optional)</Label>
                                    <Select value={goal} onValueChange={setGoal}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Goal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Engagement (Comments)">💬 Engagement</SelectItem>
                                            <SelectItem value="Reach (Shares)">🚀 Reach</SelectItem>
                                            <SelectItem value="Sales (Clicks)">💰 Sales</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Call to Action (Optional)</Label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="e.g. Link in bio"
                                        value={cta}
                                        onChange={(e) => setCta(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Auto-Post</Label>
                                    <p className="text-xs text-muted-foreground">Automatically publish at the best time</p>
                                </div>
                                <Switch checked={autoPost} onCheckedChange={setAutoPost} />
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-semibold shadow-lg"
                                size="lg"
                                onClick={handleGenerate}
                                disabled={isGenerating || !selectedFile}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Image...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-5 w-5" /> Generate Magic Caption
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Right Column: Preview */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-1 bg-primary rounded-full" />
                                <h2 className="text-xl font-semibold">Preview</h2>
                            </div>

                            {generatedPost ? (
                                <Card className="p-0 overflow-hidden border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-300">
                                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                                                {generatedPost.style} Style
                                            </span>
                                        </div>
                                        {generatedPost.auto_post && (
                                            <span className="text-xs flex items-center gap-1 text-green-600 font-medium">
                                                <CheckCircle2 className="h-3 w-3" /> Auto-Post Enabled
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Caption</Label>
                                            <Textarea
                                                className="min-h-[120px] text-base leading-relaxed resize-none border-primary/20 focus:border-primary"
                                                defaultValue={generatedPost.caption}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Hashtags</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {generatedPost.hashtags.map((tag, i) => (
                                                    <span key={i} className="text-blue-500 text-sm hover:underline cursor-pointer">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">CTA Used:</span>
                                            <span className="text-sm font-bold text-foreground">{generatedPost.cta}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/50 border-t border-border flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                                            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                                        </Button>
                                        <Button className="flex-[2]" onClick={handleSubmitPost} disabled={isPublishing}>
                                            {isPublishing ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
                                            ) : (
                                                <><Send className="mr-2 h-4 w-4" /> Post to Instagram</>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/50">
                                    <div className="p-4 bg-muted rounded-full mb-4">
                                        <Wand2 className="h-8 w-8 text-foreground/20" />
                                    </div>
                                    <p>Caption preview will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreatePost;
