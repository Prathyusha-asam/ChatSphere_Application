//region PromptCard Component
/**
 * PromptCard
 *
 * Displays a short feature or prompt text in a styled card.
 * Used on the home page to highlight key platform features.
 *
 * @param text - Content displayed inside the card
 * @returns JSX.Element - Prompt card UI
 */
export default function PromptCard({ text }: { text: string }) {
  //region Render
  /**
   * Renders prompt card
   */
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-800 hover:bg-gray-100 transition cursor-pointer">
      {text}
    </div>
  );
  //endregion Render
}
//endregion PromptCard Component