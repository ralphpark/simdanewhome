import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { dateLabel } from "../portfolio/ui";

type PublicComment = { id: string; authorName: string; content: string; createdAt: string; approved: boolean };
export function Comments({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const path = `/api/posts/${encodeURIComponent(postId)}/comments`;
  const { data, isPending, isError, refetch } = useQuery<PublicComment[]>({ queryKey: [path] });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  const mutation = useMutation({
    mutationFn: async (values: { authorName: string; authorEmail: string; content: string }) => (await apiRequest("POST", path, values)).json(),
    onSuccess: () => { setName(""); setEmail(""); setContent(""); setNotice("댓글이 접수되었습니다. 관리자 승인 후 표시됩니다."); queryClient.invalidateQueries({ queryKey: [path] }); },
    onError: () => setNotice("댓글을 보내지 못했습니다. 입력한 내용을 확인하고 다시 시도해 주세요."),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    if (!name.trim() || !email.trim() || !content.trim()) { setNotice("이름, 이메일, 댓글을 모두 입력해 주세요."); return; }
    setNotice(""); mutation.mutate({ authorName: name.trim(), authorEmail: email.trim(), content: content.trim() });
  }
  const approved = (data || []).filter(comment => comment.approved === true);
  return <section className="mb-comments mb-reading" aria-labelledby="comments-title">
    <h2 id="comments-title">함께 나누는 이야기</h2><p className="mb-comments-intro">댓글은 관리자 승인 후 공개됩니다. 이메일은 공개되지 않습니다.</p>
    <div className="mb-comment-list">{isPending ? <p role="status">댓글을 불러오고 있습니다.</p> : isError ? <p>댓글을 불러오지 못했습니다. <button className="site-link" onClick={() => refetch()}>다시 불러오기</button></p> : approved.length ? approved.map(comment => <article className="mb-comment" key={comment.id}><header><h3>{comment.authorName}</h3><time dateTime={comment.createdAt}>{dateLabel(comment.createdAt)}</time></header><p>{comment.content}</p></article>) : <p>첫 번째 이야기를 남겨주세요.</p>}</div>
    <form onSubmit={submit} className="mb-comment-form"><div className="mb-field-pair"><label htmlFor="comment-name">이름<input id="comment-name" name="authorName" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label><label htmlFor="comment-email">이메일<input id="comment-email" name="authorEmail" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label></div><label htmlFor="comment-content">댓글<textarea id="comment-content" name="content" required rows={5} maxLength={5000} value={content} onChange={event => setContent(event.target.value)} placeholder="식물과 함께한 이야기를 들려주세요." /></label><div className="mb-comment-submit"><p role="status" aria-live="polite">{notice}</p><button className="site-pill" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "보내는 중…" : "댓글 보내기"}</button></div></form>
  </section>;
}
