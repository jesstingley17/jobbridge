/**
 * OTTO (SearchAtlas) Script Verification
 * 
 * This script verifies that the OTTO installation is correct
 */

// Decoded script content from base64
const decodedScript = `
var script = document.createElement("script");
script.setAttribute("nowprocket", "");
script.setAttribute("nitro-exclude", "");
script.src = "https://dashboard.searchatlas.com/scripts/dynamic_optimization.js";
script.dataset.uuid = "2e9a3057-2dff-40ab-867b-4df43f95e055";
script.id = "sa-dynamic-optimization-loader";
document.head.appendChild(script);
`;

console.log("OTTO (SearchAtlas) Script Verification");
console.log("=====================================");
console.log("\nDecoded Script Content:");
console.log(decodedScript);
console.log("\nExpected Configuration:");
console.log("- UUID: 2e9a3057-2dff-40ab-867b-4df43f95e055");
console.log("- Script URL: https://dashboard.searchatlas.com/scripts/dynamic_optimization.js");
console.log("- Script ID: sa-dynamic-optimization-loader");
console.log("\nVerification Steps:");
console.log("1. Check if script element exists in DOM");
console.log("2. Verify UUID matches");
console.log("3. Verify script URL is accessible");
console.log("4. Check for any console errors");

// Browser verification function (to be run in browser console)
const browserVerification = `
// Run this in browser console to verify OTTO installation
(function() {
  console.log("🔍 Verifying OTTO (SearchAtlas) Installation...");
  
  // Check if loader script exists
  const loader = document.getElementById('sa-dynamic-optimization-loader');
  if (loader) {
    console.log("✅ Loader script found in DOM");
    console.log("   UUID:", loader.dataset.uuid);
    console.log("   Expected UUID: 2e9a3057-2dff-40ab-867b-4df43f95e055");
    
    if (loader.dataset.uuid === "2e9a3057-2dff-40ab-867b-4df43f95e055") {
      console.log("✅ UUID matches correctly");
    } else {
      console.error("❌ UUID mismatch!");
    }
  } else {
    console.error("❌ Loader script not found in DOM");
  }
  
  // Check if dynamic optimization script was loaded
  const scripts = Array.from(document.querySelectorAll('script[src*="dynamic_optimization"]'));
  if (scripts.length > 0) {
    console.log("✅ Dynamic optimization script loaded");
    scripts.forEach(s => console.log("   Script:", s.src));
  } else {
    console.warn("⚠️  Dynamic optimization script not yet loaded (may load asynchronously)");
  }
  
  // Check for SearchAtlas global object
  if (window.searchatlas || window.SearchAtlas) {
    console.log("✅ SearchAtlas global object found");
  } else {
    console.warn("⚠️  SearchAtlas global object not found (may load asynchronously)");
  }
  
  console.log("\\n📊 Verification complete!");
})();
`;

console.log("\nBrowser Verification Code:");
console.log(browserVerification);


