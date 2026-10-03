export interface BlogInput {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverImage: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface BlogEditorData {
  id: string | null;
  input: BlogInput;
}

export interface BlogRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  faqCount: number;
}

export interface BlogOption {
  id: string;
  title: string;
}

export interface FaqInput {
  question: string;
  answer: string;
  blogId: string | null;
  position: number;
  published: boolean;
  showOnHome: boolean;
}

export interface FaqRecord extends FaqInput {
  id: string;
  blogTitle: string | null;
}

export interface FaqListData {
  faqs: FaqRecord[];
  blogs: BlogOption[];
}

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
}

export interface PublicBlogSummary {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string | null;
}

export interface PublicBlog extends PublicBlogSummary {
  bodyHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  faqs: PublicFaq[];
}

export interface BlogSitemapEntry {
  slug: string;
  lastModified: Date | null;
}
