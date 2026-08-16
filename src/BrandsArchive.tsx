import { useEffect, useMemo, useState } from "react";

type RawNode = { id: string; name: string; mimeType: string; type: "file" | "folder"; size?: string | null; path: string[] };
export type RawArchive = { generatedAt: string; sourceFolderId: string; nodes: RawNode[] };
type MediaKind = "video" | "image" | "audio" | "other";
type Media = RawNode & { kind: MediaKind };
type Brand = { id: string; title: string; members: string[]; media: Media[] };

const pageSize = 24;
const memberOrder = ["SANGYEON", "JACOB", "YOUNGHOON", "HYUNJAE", "JUYEON", "KEVIN", "Q", "SUNWOO", "ERIC", "HAKNYEON", "NEW"];
const memberPatterns: [string, RegExp][] = [
  ["SANGYEON", /SANGYEON|상연/iu], ["JACOB", /JACOB|제이콥/iu], ["YOUNGHOON", /YOUNGHOON|영훈/iu],
  ["HYUNJAE", /HYUNJAE|현재/iu], ["JUYEON", /JUYEON|주연/iu], ["KEVIN", /KEVIN|케빈/iu],
  ["Q", /(?:^|[^A-Z])Q(?:[^A-Z]|$)|CHANGMIN|창민|큐/iu], ["SUNWOO", /SUNWOO|선우/iu], ["ERIC", /ERIC|에릭/iu],
  ["HAKNYEON", /HAKNYEON|JUHAKNYEON|학년/iu], ["NEW", /(?:^|[^A-Z])NEW(?:[^A-Z]|$)|CHANHEE|찬희|(?:^|[^\p{L}\p{N}])뉴(?:[^\p{L}\p{N}]|$)/iu],
];

const normalize = (value = "") => value.normalize("NFKD").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const cleanTitle = (value: string) => value.replace(/^\s*\d+[.)-]?\s*/u, "").trim();
const membersOf = (value: string) => memberPatterns.filter(([, pattern]) => pattern.test(value)).map(([member]) => member);
const displayMember = (value: string) => value === "HAKNYEON" ? "HAKNYEON (2017–2025)" : value === "NEW" ? "NEW (2017–2026)" : value;
const folderUrl = (id: string) => `https://drive.google.com/drive/folders/${encodeURIComponent(id)}`;
const fileUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
const downloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
const thumbnailUrl = (id: string) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`;
const kindOf = (mime = ""): MediaKind => mime.startsWith("video/") ? "video" : mime.startsWith("image/") ? "image" : mime.startsWith("audio/") ? "audio" : "other";

function buildBrands(data: RawArchive): Brand[] {
  return data.nodes.filter((node) => node.type === "folder" && node.path.length === 1).map((folder) => {
    const media = data.nodes.filter((node) => node.type === "file" && node.path[1] === folder.name).map((node) => ({ ...node, kind: kindOf(node.mimeType) }));
    return { id: folder.id, title: cleanTitle(folder.name), members: membersOf(`${folder.name} ${media.map((item) => item.name).join(" ")}`), media };
  }).sort((a, b) => a.title.localeCompare(b.title));
}

function representative(brand: Brand) { return brand.media.find((item) => item.kind === "image") || brand.media.find((item) => item.kind === "video") || null; }

function DriveThumbnail({ id, label }: { id?: string; label: string }) {
  const [failed, setFailed] = useState(!id);
  if (failed || !id) return <span className="generated-thumbnail" role="img" aria-label={`Generated preview: ${label}`}><span>{label}</span></span>;
  return <img src={thumbnailUrl(id)} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

function MediaTile({ media }: { media: Media }) {
  const visual = media.kind === "image" || media.kind === "video";
  return <figure className={`media-tile ${media.kind}-tile`}><a className="media-visual" href={fileUrl(media.id)} target="_blank" rel="noreferrer">{visual ? <DriveThumbnail id={media.id} label={media.name} /> : <DriveThumbnail label={media.name} />}{media.kind === "video" && <span className="play-mark">VIDEO / GOOGLE DRIVE ↗</span>}</a><div className="image-actions"><span className="file-name" title={media.name}>{media.name}</span><span className="file-action-links"><a href={fileUrl(media.id)} target="_blank" rel="noreferrer">VIEW ↗</a><a href={downloadUrl(media.id)} target="_blank" rel="noreferrer">DOWNLOAD ↓</a></span></div></figure>;
}

function BrandCard({ brand, open }: { brand: Brand; open: () => void }) {
  const cover = representative(brand);
  const firstVideo = brand.media.find((item) => item.kind === "video");
  return <article className="card brand-card"><button className="thumb" onClick={open} aria-label={`Open ${brand.title}`}><DriveThumbnail id={cover?.id} label={brand.title} /><span className="number">BRAND COLLABORATION</span><span className="photo-count">{brand.media.length} FILES</span></button><div className="card-info"><span className="eyebrow">{brand.members.map(displayMember).join(" · ") || "THE BOYZ"}</span><h2>{brand.title}</h2><div className="meta"><span>MEMBERS</span><strong>{brand.members.map(displayMember).join(", ") || "THE BOYZ"}</strong><span>MEDIA</span><strong>{brand.media.length} FILES</strong></div><div className="card-actions">{firstVideo && <a href={fileUrl(firstVideo.id)} target="_blank" rel="noreferrer">WATCH ↗</a>}<button onClick={open}>OPEN COLLABORATION →</button></div></div></article>;
}

function parseBrandId() { return location.hash.match(/^#\/?brand\/([^/]+)/u)?.[1] || ""; }

export function BrandsArchive({ data }: { data: RawArchive }) {
  const brands = useMemo(() => buildBrands(data), [data]);
  const [selectedId, setSelectedId] = useState(parseBrandId);
  const [query, setQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [sort, setSort] = useState("asc");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [shown, setShown] = useState(pageSize);
  useEffect(() => { const change = () => { setSelectedId(parseBrandId()); window.scrollTo({ top: 0, behavior: "smooth" }); }; window.addEventListener("hashchange", change); return () => window.removeEventListener("hashchange", change); }, []);
  const selectedBrand = brands.find((brand) => brand.id === selectedId);
  const availableMembers = memberOrder.filter((member) => brands.some((brand) => brand.members.includes(member)));
  const tokens = normalize(query).split(" ").filter(Boolean);
  const filtered = brands.filter((brand) => {
    if (memberFilter !== "all" && !brand.members.includes(memberFilter)) return false;
    const haystack = normalize([brand.title, ...brand.members, ...brand.media.map((item) => item.name)].join(" "));
    return tokens.every((token) => haystack.includes(token));
  }).sort((a, b) => sort === "desc" ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title));
  const totalMedia = brands.reduce((sum, brand) => sum + brand.media.length, 0);
  const openBrand = (brand: Brand) => { location.hash = `brand/${brand.id}`; setMediaFilter("all"); };
  const goHome = () => { location.hash = "home"; setSelectedId(""); };

  if (selectedBrand) {
    const media = selectedBrand.media.filter((item) => mediaFilter === "all" || item.kind === mediaFilter);
    return <main id="top"><Header brands={brands.length} media={totalMedia} updated={data.generatedAt} /><section className="event-page"><header className="member-gallery-head"><button onClick={goHome}>← ALL BRANDS</button><div><span>TBZ x BRANDS / COLLABORATION</span><h2>{selectedBrand.title}</h2></div><a href={folderUrl(selectedBrand.id)} target="_blank" rel="noreferrer">OPEN FOLDER ↗</a></header><div className="member-filters"><label>MEDIA TYPE<select value={mediaFilter} onChange={(event) => setMediaFilter(event.target.value)}><option value="all">ALL MEDIA</option><option value="video">VIDEO</option><option value="image">PHOTOS</option><option value="audio">AUDIO</option><option value="other">OTHER FILES</option></select></label><div className="blank-filter" /><p>{media.length} RESULTS</p></div><div className="member-period"><p>MEDIA GALLERY</p><span>GOOGLE DRIVE SOURCE</span></div>{media.length ? <div className="media-grid">{media.map((item) => <MediaTile key={item.id} media={item} />)}</div> : <div className="empty"><strong>NO MEDIA</strong>THIS COLLABORATION FOLDER IS CURRENTLY EMPTY.</div>}</section><Footer sourceId={data.sourceFolderId} /></main>;
  }

  return <main id="top"><Header brands={brands.length} media={totalMedia} updated={data.generatedAt} /><section className="controls"><div className="search"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setShown(pageSize); }} placeholder="SEARCH BRAND, MEMBER OR FILE NAME…" aria-label="Search archive" />{query && <button className="clear" onClick={() => setQuery("")}>CLEAR</button>}</div><div className="filter-row brands-filter-row"><label>MEMBER<select value={memberFilter} onChange={(event) => { setMemberFilter(event.target.value); setShown(pageSize); }}><option value="all">ALL MEMBERS</option>{availableMembers.map((member) => <option key={member} value={member}>{displayMember(member)}</option>)}</select></label><label>SORT<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="asc">A–Z</option><option value="desc">Z–A</option></select></label></div></section><section className="archive-section"><div className="results-head"><p>{filtered.length} BRAND COLLABORATIONS</p><a href={folderUrl(data.sourceFolderId)} target="_blank" rel="noreferrer">OPEN SOURCE FOLDER ↗</a></div>{filtered.length ? <div className="cards brand-cards">{filtered.slice(0, shown).map((brand) => <BrandCard key={brand.id} brand={brand} open={() => openBrand(brand)} />)}</div> : <div className="empty"><strong>NO RESULTS</strong>TRY A BRAND, MEMBER OR FILE NAME.</div>}{shown < filtered.length && <button className="load-more" onClick={() => setShown((value) => value + pageSize)}>LOAD MORE BRANDS ↓</button>}</section><Footer sourceId={data.sourceFolderId} /></main>;
}

function Header({ brands, media, updated }: { brands: number; media: number; updated: string }) { return <header className="masthead"><div className="utility"><a className="brand" href="https://tbzarchive.com/">THE BOYZ / FAN ARCHIVE</a><nav><span>TBZ x BRANDS</span><span>/</span><a href="https://x.com/tbzarchive1206_" target="_blank" rel="noreferrer">TWITTER ↗</a></nav></div><a href="#home"><h1><span className="solid">TBZ ×</span><span className="outline">BRANDS</span></h1></a><div className="stats"><p><strong>{brands}</strong> COLLABORATIONS</p><i /><p><strong>{media.toLocaleString("en-US")}</strong> MEDIA FILES</p><i /><p>UPDATED <strong>{new Date(updated).toLocaleDateString("en-GB")}</strong></p></div></header>; }
function Footer({ sourceId }: { sourceId: string }) { return <footer><span>© THE BOYZ FAN ARCHIVE</span><a href={folderUrl(sourceId)} target="_blank" rel="noreferrer">SOURCE FOLDER ↗</a><a href="#top">BACK TO TOP ↑</a></footer>; }
