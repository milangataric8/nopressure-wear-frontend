import {labelClass} from "../../constants/styles.js";

const ColorInput = ({ label, name, value, onChange }) => (
    <div>
        <label className={labelClass}>{label}</label>
        <div className="flex gap-3 items-center">
            <input
                type="color"
                name={name}
                value={value}
                onChange={onChange}
                className="w-12 h-10 border border-gray-300 cursor-pointer"
            />
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="flex-1 border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
        </div>
    </div>
);

export default ColorInput;