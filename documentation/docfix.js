const fs = require("fs");

const PROD_API_BASE_URL = "https://strapi-nerd-test.herokuapp.com/api";
const API_VERSION = "1.0.0";

const removeThis = [
  "Error",
  "Users-Permissions-RoleRequest",
  "Users-Permissions-PermissionsTree",
  "Users-Permissions-UserRegistration",
  "Users-Permissions-User",
  "Users-Permissions-Role",
  "UsersPermissionsUserResponse",
  "UsersPermissionsUserListResponse",
  "UsersPermissionsUserRequest",
  "UsersPermissionsRoleResponse",
  "UsersPermissionsRoleListResponse",
  "UsersPermissionsRoleRequest",
  "UsersPermissionsPermissionResponse",
  "UsersPermissionsPermissionListResponse",
  "UsersPermissionsPermissionRequest",
];

const replacePaths = [
  "/upload/files",
  "/upload/files/{id}",
  "/users-permissions/permissions",
  "/users-permissions/roles/{id}",
  "/users-permissions/roles",
  "/users-permissions/roles/{role}",
  "/users/count",
  "/users",
  "/users/me",
  "/users/{id}",
  "/connect/(.*)",
  "/auth/local",
  "/auth/local/register",
  "/auth/{provider}/callback",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/email-confirmation",
  "/auth/send-email-confirmation",
];

function fixDocumentation() {
  if (process.env.STAGING === "DEVELOPMENT") {
    try {
      //load up the needing to be modified document
      console.log("Loading up documentation file");
      let rawdata = fs.readFileSync(
        `./src/extensions/documentation/documentation/1.0.0/full_documentation.json`
      );
      let document = JSON.parse(rawdata);

      //load up the refrence doc
      console.log("Loading up fixed reference file");
      rawdata = fs.readFileSync(
        "./documentation/reference/full_documentation-reference.json"
      );
      let documentRef = JSON.parse(rawdata);

      //replace all the schema objects that need to replaced from the reference doc
      console.log("Fixing plugin schemas");
      let schemas = document.components.schemas;
      for (let i = 0; i < removeThis.length; i++) {
        schemas[removeThis[i]] = documentRef.components.schemas[removeThis[i]];
      }

      //replace all the paths objects that need to be replaced from the reference doc
      console.log("Updating plugin paths");
      let paths = document.paths;
      for (let i = 0; i < replacePaths.length; i++) {
        paths[replacePaths[i]] = documentRef.paths[replacePaths[i]];
      }

      //go through the component shcemas that for some reason add a required object in the wrong place even though it already creates the correct required object
      console.log("Fixing empty required bug");
      let schemaKeys = Object.keys(schemas);
      for (let i = 0; i < schemaKeys.length; i++) {
        if (schemaKeys[i].includes("Request")) {
          if (schemas[schemaKeys[i]].properties.data.required) {
            let requiredLength =
              schemas[schemaKeys[i]].properties.data.required.length;
            if (requiredLength < 1) {
              delete schemas[schemaKeys[i]].properties.data.required;
            }
          }
        }
      }

      //create a variable to replace the old documents servers property, this will direct our api docs to the production api. Or what ever api we want them to test things on. Odds are more of a staging one
      console.log("Updating server url to '" + PROD_API_BASE_URL + "'");
      let servers = [
        {
          url: PROD_API_BASE_URL,
          description: "Production Server",
        },
      ];

      //implement the modified schemas from the old document
      document.components.schemas = schemas;
      document.paths = paths;
      document.servers = servers;

      let data = JSON.stringify(document);
      fs.writeFileSync("./documentation/full_documentation-fixed.json", data);
      console.log("-------------------------");
      console.log("         Done ✅");
      console.log("-------------------------");
      // console.log(student);
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = { fixDocumentation };
