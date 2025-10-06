// Components/InputField.jsx
// ملاحظة: هذا عنصر إدخال عام. واجهة مؤقتة للاختبار ويمكن تغييره أو حذفه مستقبلاً.
export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  autoComplete,
}) {
  return (
    <div className="mb-4">
      {/* تسمية الحقل */}
      <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* حقل الإدخال */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2 text-sm leading-tight text-gray-700 dark:text-white border rounded shadow appearance-none focus:outline-none focus:shadow-outline ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {/* رسالة خطأ بالإنجليزي لواجهة المستخدم */}
      {error && <p className="text-xs italic text-red-500">{error}</p>}
    </div>
  );
}
