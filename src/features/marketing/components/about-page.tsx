import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { colors } from "@/config/brand";
import { AuthCta } from "./auth-cta";

function StoryHeading({ children, first }: { children: ReactNode; first?: boolean }) {
  return (
    <h2
      className={`text-2xl sm:text-3xl font-bold mb-6 ${first ? "mt-2" : "mt-16 sm:mt-20"}`}
      style={{ color: colors.navy }}
    >
      {children}
    </h2>
  );
}

function StoryP({ children }: { children: ReactNode }) {
  return (
    <p className="text-base sm:text-lg leading-loose mb-6" style={{ color: "#3A4A57" }}>
      {children}
    </p>
  );
}

function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      className="my-8 pl-5 pr-4 py-3 rounded-r-lg"
      style={{ borderLeft: `3px solid ${colors.orange}`, background: colors.orangeT }}
    >
      <p className="text-lg sm:text-xl font-semibold leading-snug" style={{ color: colors.navy }}>
        {children}
      </p>
    </blockquote>
  );
}

export function AboutPage() {
  return (
    <section className="px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-2xl mx-auto text-center mb-4">
        <LogoMark size={40} />
        <h1 className="text-2xl sm:text-3xl font-bold mt-4" style={{ color: colors.navy }}>
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
          We had a three-minute argument. My partner insisted that she didn't have it.
          I was sure I had seen that book before, but she insisted that if she had it,
          she would remember.
        </StoryP>

        <StoryP>
          So I told her, <strong>"Read it."</strong>
        </StoryP>

        <StoryP>
          She took the book, read a few pages while we were still walking around the
          store, and after about a minute of browsing, she said:
        </StoryP>

        <PullQuote>"Ahh, yes. I have this book already."</PullQuote>

        <StoryP>End of argument.</StoryP>

        <StoryP>We saved $50 and bought another book instead.</StoryP>

        <StoryP>
          That simple problem kept bugging me when I went to bed. It kept me awake
          until 4 a.m. I started thinking about all the other situations my partner
          seemed to have with the love of her life: <strong>her books.</strong>
        </StoryP>

        <PullQuote>"Babe, you should've read this book—oops, but I already lost it."</PullQuote>
        <PullQuote>"Do you remember where I put this book?"</PullQuote>
        <PullQuote>"I remember someone borrowed this book, but now I don't have the complete set. Urrrgh."</PullQuote>

        <StoryP>
          And then there was me—a casual reader whom she had influenced to start
          reading. I had a hard time finishing a book at first, was lazy about making
          time to read, forgot where I left off, lost my bookmarks, and left
          dog-eared pages that she would definitely be mad about.
        </StoryP>

        <StoryP>
          At around 4:30 a.m., I decided to get out of bed and write a PRD—a Product
          Requirements Document. It's a document that product managers use to define
          and build software products.
        </StoryP>

        <StoryP>
          As a product manager, I've spent the past eight years helping create and
          improve apps and features.
        </StoryP>

        <StoryP>So I thought:</StoryP>

        <PullQuote>"Why can't I solve this problem myself?"</PullQuote>

        <StoryP>Then the ideas started flowing nonstop.</StoryP>

        <StoryP>
          Within an hour, I had written the PRD for my MVP (Minimum Viable Product) app.
        </StoryP>

        <StoryP>And I decided:</StoryP>

        <p
          className="text-lg sm:text-xl font-bold text-center my-8 leading-snug"
          style={{ color: colors.green }}
        >
          This will be my first personal project. I will launch this app this year.
        </p>

        <StoryHeading>Behind the Name: Booklod</StoryHeading>

        <StoryP>Simple.</StoryP>

        <StoryP>
          I thought of a lot of wordplay around the word <strong>"book"</strong> and
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
          Then the word <strong>"Buklod"</strong> came to mind.
        </StoryP>

        <StoryP>It felt perfect for the goal.</StoryP>

        <StoryP>
          <strong>"Buklod"</strong> is a Filipino word meaning{" "}
          <strong>to bond, unify, and hold things together</strong>.
        </StoryP>

        <p
          className="text-3xl sm:text-4xl font-bold text-center mt-10 mb-6"
          style={{ color: colors.navy }}
        >
          Buklod <span style={{ color: colors.muted, fontWeight: 500 }}>→</span>{" "}
          Book<span style={{ color: colors.green }}>l</span>
          <span style={{ color: colors.orange }}>od</span>
        </p>

        <blockquote
          className="text-center rounded-2xl px-6 py-6 sm:px-10 sm:py-8"
          style={{ background: colors.greenT }}
        >
          <p className="text-base sm:text-lg font-semibold leading-relaxed" style={{ color: colors.navy }}>
            A personal book tracker to log what you've read, what you own, and your
            reading history.
          </p>
        </blockquote>
      </div>

      {/* End of page CTA */}
      <div className="max-w-2xl mx-auto text-center mt-16 sm:mt-20 pt-12 border-t" style={{ borderColor: colors.tan }}>
        <h3 className="text-xl sm:text-2xl font-bold" style={{ color: colors.navy }}>
          Ready to start your own reading archive?
        </h3>
        <p className="text-sm sm:text-base mt-2" style={{ color: colors.muted }}>
          Your books. Your reading. Your archive.
        </p>
        <AuthCta
          authedLabel="Open App"
          guestLabel="Get Started Free"
          className="inline-block mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm"
          style={{ background: colors.orange }}
        />
      </div>
    </section>
  );
}
