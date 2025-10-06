// Components/MessageBox.jsx
// ملاحظة: صندوق رسائل بسيط للنجاح/الفشل. مؤقت للاختبار.
export default function MessageBox({ message, kind = "info" }) {
  if (!message) return null;
  const style =
    kind === "error"
      ? "bg-red-100 text-red-800 border-red-400"
      : "bg-green-100 text-green-800 border-green-400";
  return <div className={`border-l-4 p-3 my-3 rounded ${style}`}>{message}</div>;
}
