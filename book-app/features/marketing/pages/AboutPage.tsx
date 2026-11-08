"use client";
import { C } from "../../../app/components/theme";
import { LogoMark } from "../../../app/components/ui/LogoMark";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";



// ---------------------------------------------------------------------------
// About page — the founder story, a real editorial page (not a popup)
// ---------------------------------------------------------------------------
export function StoryHeading({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return (
    <h2
      className={`text-2xl sm:text-3xl font-bold mb-6 ${first ? "mt-2" : "mt-16 sm:mt-20"}`}
      style={{ color: C.navy }}
    >
      {children}
    </h2>
  );
}


export function StoryP({ children }: { children: ReactNode }) {
  return (
    <p className="text-base sm:text-lg leading-loose mb-6" style={{ color: "#3A4A57" }}>
      {children}
    </p>
  );
}


export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      className="my-8 pl-5 pr-4 py-3 rounded-r-lg"
      style={{ borderLeft: `3px solid ${C.orange}`, background: C.orangeT }}
    >
      <p className="text-lg sm:text-xl font-semibold leading-snug" style={{ color: C.navy }}>
        {children}
      </p>
    </blockquote>
  );
}


export function AboutPage() {
  const router = useRouter();
  return (
    <section className="px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-2xl mx-auto text-center mb-4">
        <LogoMark size={40} />
        <h1 className="text-2xl sm:text-3xl font-bold mt-4" style={{ color: C.navy }}>
          About Booklod
        </h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <StoryHeading first>Our Story</StoryHeading>

        <StoryP>
          One late night, I was looking at our bookshelf and saw a set of books by
          Toshikazu Kawaguchi. Then I noticed the yellow one—and I got stuck.
        </StoryP>

        <StoryP>
          It brought back a memory from just a few weeks earlier, when we were at a
          bookstore and almost bought the same book again.
        </StoryP>

        <StoryP>
          We had a three-minute argument. My partner insisted that she didn&apos;t have it.
          I was sure I had seen that book before, but she insisted that if she had it,
          she would remember.
        </StoryP>

        <StoryP>
          So I told her, <strong>&quot;Read it.&quot;</strong>
        </StoryP>

        <StoryP>
          She took the book, read a few pages while we were still walking around the
          store, and after about a minute of browsing, she said:
        </StoryP>

        <PullQuote>&quot;Ahh, yes. I have this book already.&quot;</PullQuote>

        <StoryP>End of argument.</StoryP>

        <StoryP>We saved $50 and bought another book instead.</StoryP>

        <StoryP>
          That simple problem kept bugging me when I went to bed. It kept me awake
          until 4 a.m. I started thinking about all the other situations my partner
          seemed to have with the love of her life: <strong>her books.</strong>
        </StoryP>

        <PullQuote>&quot;Babe, you should&apos;ve read this book—oops, but I already lost it.&quot;</PullQuote>
        <PullQuote>&quot;Do you remember where I put this book?&quot;</PullQuote>
        <PullQuote>&quot;I remember someone borrowed this book, but now I don&apos;t have the complete set. Urrrgh.&quot;</PullQuote>

        <StoryP>
          And then there was me—a casual reader whom she had influenced to start
          reading. I had a hard time finishing a book at first, was lazy about making
          time to read, forgot where I left off, lost my bookmarks, and left
          dog-eared pages that she would definitely be mad about.
        </StoryP>

        <StoryP>
          At around 4:30 a.m., I decided to get out of bed and write a PRD—a Product
          Requirements Document. It&apos;s a document that product managers use to define
          and build software products.
        </StoryP>

        <StoryP>
          As a product manager, I&apos;ve spent the past eight years helping create and
          improve apps and features.
        </StoryP>

        <StoryP>So I thought:</StoryP>

        <PullQuote>&quot;Why can&apos;t I solve this problem myself?&quot;</PullQuote>

        <StoryP>Then the ideas started flowing nonstop.</StoryP>

        <StoryP>
          Within an hour, I had written the PRD for my MVP (Minimum Viable Product) app.
        </StoryP>

        <StoryP>And I decided:</StoryP>

        <p
          className="text-lg sm:text-xl font-bold text-center my-8 leading-snug"
          style={{ color: C.green }}
        >
          This will be my first personal project. I will launch this app this year.
        </p>

        <StoryHeading>Behind the Name: Booklod</StoryHeading>

        <StoryP>Simple.</StoryP>

        <StoryP>
          I thought of a lot of wordplay around the word <strong>&quot;book&quot;</strong> and
          searched for names that were already being used by apps, companies, and
          businesses.
        </StoryP>

        <StoryP>After about an hour of thinking, I came back to something closer to home.</StoryP>

        <StoryP>
          One of my goals is to build something that can be useful for{" "}
          <strong>Filipino readers</strong>, especially readers who appreciate
          simplicity rather than an overwhelming archive filled with too many
          features.
        </StoryP>

        <StoryP>
          Then the word <strong>&quot;Buklod&quot;</strong> came to mind.
        </StoryP>

        <StoryP>It felt perfect for the goal.</StoryP>

        <StoryP>
          <strong>&quot;Buklod&quot;</strong> is a Filipino word meaning{" "}
          <strong>to bond, unify, and hold things together</strong>.
        </StoryP>

        <p
          className="text-3xl sm:text-4xl font-bold text-center mt-10 mb-6"
          style={{ color: C.navy }}
        >
          Buklod <span style={{ color: C.muted, fontWeight: 500 }}>→</span>{" "}
          Book<span style={{ color: C.green }}>l</span>
          <span style={{ color: C.orange }}>od</span>
        </p>

        <blockquote
          className="text-center rounded-2xl px-6 py-6 sm:px-10 sm:py-8"
          style={{ background: C.greenT }}
        >
          <p className="text-base sm:text-lg font-semibold leading-relaxed" style={{ color: C.navy }}>
            A personal book tracker to log what you&apos;ve read, what you own, and your
            reading history.
          </p>
        </blockquote>
      </div>

      {/* End of page CTA */}
      <div className="max-w-2xl mx-auto text-center mt-16 sm:mt-20 pt-12 border-t" style={{ borderColor: C.tan }}>
        <h3 className="text-xl sm:text-2xl font-bold" style={{ color: C.navy }}>
          Ready to start your own reading archive?
        </h3>
        <p className="text-sm sm:text-base mt-2" style={{ color: C.muted }}>
          Your books. Your reading. Your archive.
        </p>
        <button
          onClick={() => router.push("/signin")}
          className="mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm"
          style={{ background: C.orange }}
        >
          Get Started Free
        </button>
      </div>
    </section>
  );
}
