Initialize Turbo Repo

Step-1 : npx create-turbo@latest

Step-2 : Select pnpm / npm / yarn (In this project pnpm is used)

Step-3 : Inside root folder pnpm install

Step-4 : Create a http and wesocket backend folder and initialize node module npm init -y

Step-5 : Manually create tsconfig.json in both folders

Step-6 : { extends: "//name of package.json from packages - @repo/typescript-config" }

Step-7 : Add new dependency - "packages/typescript-config/package.json": "workspace:_" if not using pnpm _ will work, for pnpm use (workspace:\*)
