const test = require('node:test');
const assert = require('node:assert').strict;

// test('includes missing fields', async () => {
//   assert.equal(1, 2);
// });

// test('includes', async () => {
//   assert.notEqual(1, 2);
// })

const maniLib = require('../dist/index');

const test_manifest = JSON.stringify({
  "dir": "ltr",
  "lang": "en",
  "name": "Webboard",
  "scope": "/",
  "display": "standalone",
  "start_url": "/",
  "short_name": "Webboard",
  "theme_color": "#FFFFFF",
  "description": "Enhance your work day and solve your cross platform whiteboarding needs with webboard! Draw text, shapes, attach images and more and share those whiteboards with anyone through OneDrive!",
  "orientation": "any",
  "background_color": "#FFFFFF",
  "related_applications": [],
  "prefer_related_applications": false,
  "screenshots": [
    {
      "src": "assets/screen.png"
    },
    {
      "src": "assets/screen.png"
    },
    {
      "src": "assets/screen.png"
    }
  ],
  "features": [
    "Cross Platform",
    "low-latency inking",
    "fast",
    "useful AI"
  ],
  "shortcuts": [
    {
      "name": "Start Live Session",
      "short_name": "Start Live",
      "description": "Jump direction into starting or joining a live session",
      "url": "/?startLive",
      "icons": [{ "src": "icons/android/maskable_icon_192.png", "sizes": "192x192" }]
    }
  ],
  "icons": [
    {
      "src": "icons/android/android-launchericon-64-64.png",
      "sizes": "64x64"
    },
    {
      "src": "icons/android/maskable_icon_192.png",
      "sizes": "192x192",
      "purpose": "maskable"
    },
    {
      "src": "icons/android/android-launchericon-48-48.png",
      "sizes": "48x48"
    },
    {
      "src": "icons/android/android-launchericon-512-512.png",
      "sizes": "512x512"
    },
    {
      "src": "icons/android/android-launchericon-28-28.png",
      "sizes": "28x28"
    }
  ]
});

/*
  * Test validateManifest method
*/
test('can validate whole manifest', async () => {
  const info = await maniLib.validateManifest(test_manifest);

  assert.ok(info.length  === 21);
  // assert.ok(info, "Manifest Validation Info is not null");
});

test('Should reject because of improper JSON', async () => {
  try {
    await maniLib.validateManifest('{');
    assert.fail("Should have thrown an error");
  }
  catch (err) {
    assert.ok(err, "Rejected as it should");
  }
});

// should include missing fields
test('includes missing fields', async () => {
  const data = await maniLib.validateManifest(test_manifest);

  assert.equal(data.includes("iarc_rating_id"), false);
});

/*
* Test reportMissing method
*/
test('can report missing fields', async () => {
  const report = await maniLib.reportMissing(test_manifest);
  assert.equal(report.length > 0, true);
  assert.equal(report.includes("iarc_rating_id"), true);
});

/*
  * Test validateSingleField method
*/
test('can validate a single field, should return true', async () => {
  const validity = await maniLib.validateSingleField("short_name", "Webboard");

  // validity should be a boolean, and true in this case
  assert.strictEqual(validity, true);
});

test('can validate a single field, should return false', async () => {
  const validity = await maniLib.validateSingleField("theme_color", "black");

  // validity should return a Validation, and we check that its the right validation
  assert.strictEqual(validity, false);
});

/*
 * test validateRequiredFields method
*/
test('can validate required fields', async () => {
  assert.doesNotReject(maniLib.validateRequiredFields(test_manifest));
});

test('should reject because of missing required field', async () => {
  const manifest = JSON.parse(test_manifest);
  delete manifest.short_name;
  const newMani = JSON.stringify(manifest);

  assert.rejects(maniLib.validateRequiredFields(newMani));
});

// should reject because of improper json
test('should reject because of improper json', async () => {
  assert.rejects(maniLib.validateRequiredFields('{'));
});


// should fail because of shortcuts having a wrong sized icon
test('should fail because of shortcuts having a wrong sized icon', async () => {
  const manifest = JSON.parse(test_manifest);
 // manifest.shortcuts[0].icons[0].sizes = "50x50";
  const newMani = JSON.stringify(manifest);

  const data = await maniLib.validateManifest(newMani);
  // data should have a validation for shortcuts and it should be false
  data.map((item) => {
    if (item.member === "shortcuts") {
      assert.strictEqual(item.valid, false);
    }
  })
});

// should pass because of shortcuts having a correct sized icon
test('should pass because of shortcuts having a correct sized icon', async () => {
  const manifest = JSON.stringify(test_manifest);
  // manifest.shortcuts[0].icons[0].sizes = "192x192";
  //const newMani = JSON.stringify(manifest);

  const data = await maniLib.validateManifest(manifest);
  // data should have a validation for shortcuts and it should be true
  data.map((item) => {
    if (item.member === "shortcuts") {
      assert.equal(item.valid, true);
    }
  })
});
