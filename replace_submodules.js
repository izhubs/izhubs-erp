const fs = require("fs");
const path = require("path");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes("node_modules") && !file.includes(".git") && !file.includes(".next")) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".scss")) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = [...walk("D:\\Project\\izhubs-erp\\packages\\izerp-plugin"), ...walk("D:\\Project\\izhubs-erp\\packages\\izerp-theme")];
let changedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    let original = content;

    content = content.replace(/@\/modules\/(biz-ops|crm|invoices|izlanding|reports|contracts)/g, "@izerp-plugin/modules/$1");
    content = content.replace(/@\/components\/plugins/g, "@izerp-plugin/components/plugins");
    content = content.replace(/@\/components\/ui/g, "@izerp-theme/components/ui");
    content = content.replace(/@\/templates/g, "@izerp-theme/templates");

    if (content !== original) {
        fs.writeFileSync(file, content, "utf8");
        changedCount++;
    }
}
console.log("Updated imports in " + changedCount + " files inside submodules.");
