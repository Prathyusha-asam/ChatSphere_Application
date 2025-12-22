export default function PromptCard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-800 hover:bg-gray-100 transition cursor-pointer">
      {text}
    </div>
  );
}
