// Components/PasswordField.jsx
// ملاحظة: عنصر خاص بكلمات السر. واجهة مؤقتة للاختبار ويمكن تغييره لاحقاً.
export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}) {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-white">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2 text-sm leading-tight text-gray-700 dark:text-white border rounded shadow appearance-none focus:outline-none focus:shadow-outline ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {error && <p className="text-xs italic text-red-500">{error}</p>}
    </div>
  );
}
