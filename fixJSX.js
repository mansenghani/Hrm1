const fs = require('fs');
let content = fs.readFileSync('e:\\\\Hrm\\\\frontend\\\\admin\\\\src\\\\pages\\\\admin\\\\EmployeeForm.jsx', 'utf8');

function addError(name, type='input', maxLen=null) {
    // We want to find the tag with this name.
    const regexStr = '<' + type + '[^>]*?name="' + name + '"[^>]*?>';
    const regex = new RegExp(regexStr, 'g');
    content = content.replace(regex, (match) => {
        // If it already has errors.name logic, skip
        if (match.includes('errors.' + name)) return match;
        
        let newMatch = match.replace('className="', 'className={`');
        newMatch = newMatch.replace('border-transparent focus:border-[#F0B90B] rounded-xl', '${errors.' + name + ' ? \\'border-[#F6465D]\\' : \\'border-transparent focus:border-[#F0B90B]\\'} rounded-xl');
        
        // Fix ending quote of className
        newMatch = newMatch.replace(/className=\{`([^`"]*)"/, 'className={`$1`}');
        
        if (maxLen) {
            newMatch = newMatch.replace('/>', ` maxLength={${maxLen}} />`);
        }
        
        return newMatch + '\n               {errors.' + name + ' && <p className="text-[10px] text-[#F6465D] font-bold uppercase tracking-widest mt-1">{errors.' + name + '}</p>}';
    });
}

addError('fullName', 'input');
addError('email', 'input');
addError('personalEmail', 'input');
addError('password', 'input', 20);
addError('phone', 'input', 15);
addError('role', 'select');
addError('managerId', 'select');
addError('joinDate', 'input');
addError('dob', 'input');
addError('employmentType', 'select');
addError('gender', 'select');

// Hand-code the address block because it's a textarea and we need the char counter
const addrRegex = /<textarea[^>]*?name="address"[^>]*?\/>/g;
content = content.replace(addrRegex, (match) => {
    if (match.includes('errors.address')) return match;
    let newMatch = match.replace('className="', 'className={`');
    newMatch = newMatch.replace('border-transparent focus:border-[#F0B90B] rounded-xl', '${errors.address ? \\'border-[#F6465D]\\' : \\'border-transparent focus:border-[#F0B90B]\\'} rounded-xl');
    newMatch = newMatch.replace(/className=\{`([^`"]*)"/, 'className={`$1`}');
    newMatch = newMatch.replace('/>', ' maxLength={250} />');
    
    return newMatch + '\n               <div className="flex justify-between items-center mt-1">\n                 {errors.address ? <p className="text-[10px] text-[#F6465D] font-bold uppercase tracking-widest">{errors.address}</p> : <div></div>}\n                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#848E9C]">{formData.address?.length || 0}/250</p>\n               </div>';
});

// Also fix Employee ID to have *? It's not editable.
// Just add stars to labels that need it.
function addStar(name, labelText) {
    content = content.replace(labelText, labelText + ' *');
}
// Already added in some places, let's just make sure.

fs.writeFileSync('e:\\\\Hrm\\\\frontend\\\\admin\\\\src\\\\pages\\\\admin\\\\EmployeeForm.jsx', content);
console.log('Done!');
