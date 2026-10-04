import { colors } from "@/config/brand";

/** "Booklod" with the brand-coloured "l" and "od". Renders inline — wrap it in your own element. */
export function Wordmark() {
  return (
    <>
      Book<span style={{ color: colors.green }}>l</span>
      <span style={{ color: colors.orange }}>od</span>
    </>
  );
}
