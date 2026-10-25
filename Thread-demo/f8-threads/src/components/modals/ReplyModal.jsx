import { useEffect, useRef, useState } from "react";
import {
    Check,
    ChevronRight,
    ImagePlay,
    Images,
    ListOrdered,
    MapPin,
    X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
    MediaGallery,
    PostMeta,
    PostText,
} from "@/components/post/PostContent";
import { QuotedPost } from "@/components/post/QuotedPost";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
    createPost,
    createReply,
    quotePost,
    updatePost,
} from "@/store/slices/postsSlice";
import { fetchReplies } from "@/store/slices/repliesSlice";
import { EmojiPicker } from "./EmojiPicker";

const MAX_LENGTH = 500;
const MAX_FILES = 10;
export const REPLY_PERMISSIONS = [
    "everyone",
    "followers",
    "following",
    "mentioned",
];

export default function ReplyModal({ mode = "reply", post, onClose }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const me = useSelector(selectCurrentUser);
    const repliesLoaded = useSelector((state) =>
        post ? Boolean(state.replies.byParent[post.id]) : false,
    );

    const [content, setContent] = useState(
        mode === "edit" ? (post?.content ?? "") : "",
    );
    const [files, setFiles] = useState([]);
    const [topic, setTopic] = useState(null);
    const [permission, setPermission] = useState(
        post && mode === "edit"
            ? (post.reply_permission ?? "everyone")
            : "everyone",
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const textareaRef = useRef(null);
    const mediaInputRef = useRef(null);
    const gifInputRef = useRef(null);

    const filesRef = useRef(files);
    useEffect(() => {
        filesRef.current = files;
    }, [files]);
    useEffect(
        () => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)),
        [],
    );

    const trimmed = content.trim();
    const tooLong = content.length > MAX_LENGTH;

    const canPost =
        (trimmed.length > 0 || files.length > 0) && !tooLong && !submitting;

    const titles = {
        reply: "composer.replyTitle",
        quote: "composer.quoteTitle",
        create: "composer.createTitle",
        edit: "composer.editTitle",
    };
    const placeholders = {
        reply: t("composer.replyPlaceholder", {
            username: post?.user?.username,
        }),
        quote: t("composer.quotePlaceholder"),
        create: t("composer.createPlaceholder"),
        edit: t("composer.createPlaceholder"),
    };

    const addFiles = (list) => {
        const picked = Array.from(list ?? []).filter(
            (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
        );
        if (files.length + picked.length > MAX_FILES)
            toast.error(t("composer.tooManyFiles", { max: MAX_FILES }));
        const next = picked
            .slice(0, MAX_FILES - files.length)
            .map((file) => ({ file, url: URL.createObjectURL(file) }));
        setFiles((prev) => [...prev, ...next]);
    };

    const removeFile = (url) => {
        URL.revokeObjectURL(url);
        setFiles((prev) => prev.filter((f) => f.url !== url));
    };

    const insertEmoji = (emoji) => {
        const el = textareaRef.current;
        const start = el?.selectionStart ?? content.length;
        const end = el?.selectionEnd ?? content.length;
        setContent(content.slice(0, start) + emoji + content.slice(end));
        requestAnimationFrame(() => {
            el?.focus();
            el?.setSelectionRange(start + emoji.length, start + emoji.length);
        });
    };

    const submit = async () => {
        if (!canPost) return;
        setSubmitting(true);
        setError(null);
        const fields = {
            content: trimmed,
            media: files.map((f) => f.file),
            reply_permission: permission,
            topic_name: topic?.trim() || undefined,
        };
        try {
            if (mode === "reply") {
                await dispatch(
                    createReply({ parentId: post.id, ...fields }),
                ).unwrap();
                if (repliesLoaded)
                    dispatch(fetchReplies({ postId: post.id, refresh: true }));
                toast(t("toast.replied"));
            } else if (mode === "quote") {
                await dispatch(
                    quotePost({ postId: post.id, ...fields }),
                ).unwrap();
                toast(t("toast.quoted"));
            } else if (mode === "edit") {
                await dispatch(updatePost({ id: post.id, ...fields })).unwrap();
                toast(t("toast.updated"));
            } else {
                await dispatch(createPost(fields)).unwrap();
                toast(t("toast.posted"));
            }
            onClose();
        } catch (err) {
            setError(
                err?.fieldErrors?.content ??
                    err?.fieldErrors?.["media.0"] ??
                    err?.message ??
                    t("errors.generic"),
            );
        } finally {
            setSubmitting(false);
        }
    };

    const toolbarButton =
        "grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

    return (
        <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
            <DialogContent
                aria-describedby="composer-desc"
                className="max-w-[600px] p-0"
            >
                <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center border-b bg-card px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="justify-self-start text-[15px]"
                    >
                        {t("common.cancel")}
                    </button>
                    <DialogTitle>{t(titles[mode])}</DialogTitle>
                    <span />
                </div>
                <DialogDescription id="composer-desc" className="sr-only">
                    {placeholders[mode]}
                </DialogDescription>

                <div className="px-5 pt-4">
                    {/* Bài đang được trả lời, nối với ô soạn bằng đường dọc */}
                    {mode === "reply" && post && (
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <UserAvatar user={post.user} />
                                <span className="mt-1.5 mb-1 w-0.5 flex-1 rounded-full bg-line" />
                            </div>
                            <div className="min-w-0 flex-1 pb-4">
                                <PostMeta post={post} linkTime={false} />
                                <PostText
                                    text={post.content}
                                    className="mt-0.5 line-clamp-4"
                                />
                                <MediaGallery
                                    urls={post.media_urls?.slice(0, 3)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <UserAvatar user={me} />
                            <span className="mt-1.5 w-0.5 flex-1 rounded-full bg-line" />
                        </div>

                        <div className="min-w-0 flex-1 pb-3">
                            <div className="flex items-center gap-1 text-[15px]">
                                <span className="font-semibold">
                                    {me?.username}
                                </span>
                                {topic === null ? (
                                    <button
                                        type="button"
                                        onClick={() => setTopic("")}
                                        className="flex items-center text-muted-foreground hover:text-foreground"
                                    >
                                        <ChevronRight className="size-4" />
                                        {t("composer.addTopic")}
                                    </button>
                                ) : (
                                    <span className="flex min-w-0 items-center text-muted-foreground">
                                        <ChevronRight className="size-4 shrink-0" />
                                        <input
                                            autoFocus
                                            value={topic}
                                            maxLength={50}
                                            onChange={(e) =>
                                                setTopic(e.target.value)
                                            }
                                            onBlur={() =>
                                                !topic.trim() && setTopic(null)
                                            }
                                            placeholder={t(
                                                "composer.topicPlaceholder",
                                            )}
                                            aria-label={t("composer.addTopic")}
                                            className="min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                                        />
                                    </span>
                                )}
                            </div>

                            <Textarea
                                ref={textareaRef}
                                autoFocus={topic === null}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        (e.metaKey || e.ctrlKey)
                                    )
                                        submit();
                                }}
                                placeholder={placeholders[mode]}
                                aria-label={placeholders[mode]}
                                className="mt-0.5 max-h-[40vh] min-h-6 overflow-y-auto"
                            />

                            {/* Ảnh / video đã chọn */}
                            {files.length > 0 && (
                                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                    {files.map(({ file, url }) => (
                                        <div
                                            key={url}
                                            className="relative shrink-0"
                                        >
                                            {file.type.startsWith("video/") ? (
                                                <video
                                                    src={url}
                                                    className="h-40 rounded-lg border"
                                                    muted
                                                />
                                            ) : (
                                                <img
                                                    src={url}
                                                    alt=""
                                                    className="h-40 rounded-lg border object-cover"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(url)}
                                                aria-label={t(
                                                    "composer.removeMedia",
                                                )}
                                                className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/70 text-white"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {mode === "edit" &&
                                post?.media_urls?.length > 0 && (
                                    <MediaGallery urls={post.media_urls} />
                                )}

                            {mode === "quote" && post && (
                                <QuotedPost post={post} interactive={false} />
                            )}

                            {/* Thanh công cụ: ảnh/video, GIF, emoji, khảo sát, vị trí */}
                            <div className="mt-2 -ml-1.5 flex items-center gap-0.5">
                                <button
                                    type="button"
                                    aria-label={t("composer.media")}
                                    onClick={() =>
                                        mediaInputRef.current?.click()
                                    }
                                    className={toolbarButton}
                                >
                                    <Images className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label={t("composer.gif")}
                                    onClick={() => gifInputRef.current?.click()}
                                    className={toolbarButton}
                                >
                                    <ImagePlay className="size-5" />
                                </button>
                                <EmojiPicker
                                    onPick={insertEmoji}
                                    triggerClassName={toolbarButton}
                                />
                                <button
                                    type="button"
                                    aria-label={t("composer.poll")}
                                    onClick={() =>
                                        toast(t("composer.comingSoon"))
                                    }
                                    className={toolbarButton}
                                >
                                    <ListOrdered className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label={t("composer.location")}
                                    onClick={() =>
                                        toast(t("composer.comingSoon"))
                                    }
                                    className={toolbarButton}
                                >
                                    <MapPin className="size-5" />
                                </button>
                                <input
                                    ref={mediaInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    hidden
                                    onChange={(e) => {
                                        addFiles(e.target.files);
                                        e.target.value = "";
                                    }}
                                />
                                <input
                                    ref={gifInputRef}
                                    type="file"
                                    accept="image/gif"
                                    hidden
                                    onChange={(e) => {
                                        addFiles(e.target.files);
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add to thread */}
                    {mode !== "edit" && (
                        <button
                            type="button"
                            onClick={() => toast(t("composer.comingSoon"))}
                            className="flex items-center gap-3 pb-2 text-[15px] text-muted-foreground"
                        >
                            <span className="flex w-9 justify-center opacity-50">
                                <UserAvatar user={me} size={18} />
                            </span>
                            {t("composer.addToThread")}
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 px-5 pt-2 pb-4">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="rounded-lg text-left text-[15px] text-muted-foreground outline-none hover:text-foreground">
                            {t("composer.replyOptions")}:{" "}
                            <span className="font-medium">
                                {t(`composer.permission.${permission}`)}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="z-[60]">
                            <DropdownMenuLabel>
                                {t("composer.whoCanReply")}
                            </DropdownMenuLabel>
                            {REPLY_PERMISSIONS.map((value) => (
                                <DropdownMenuItem
                                    key={value}
                                    onSelect={() => setPermission(value)}
                                >
                                    {t(`composer.permission.${value}`)}
                                    {permission === value && <Check />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-3">
                        {content.length > MAX_LENGTH - 50 && (
                            <span
                                className={cn(
                                    "text-sm tabular-nums",
                                    tooLong
                                        ? "text-destructive"
                                        : "text-muted-foreground",
                                )}
                            >
                                {MAX_LENGTH - content.length}
                            </span>
                        )}
                        <Button
                            variant="outline"
                            disabled={!canPost}
                            onClick={submit}
                            className="min-w-[72px] rounded-xl"
                        >
                            {submitting ? (
                                <Spinner className="size-4" />
                            ) : (
                                t(
                                    mode === "edit"
                                        ? "common.save"
                                        : "composer.post",
                                )
                            )}
                        </Button>
                    </div>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="px-5 pb-4 text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
