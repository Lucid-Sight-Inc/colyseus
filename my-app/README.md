How to customize the `@colyseus/arena` package:

```typescript
npm run boot
```

Run the root of this project:

After making modifications to `packages/arena-hosted/src` files, we have to:

- Build & compress the `packages/arena-hosted` package.
- Run: `npm run build-arena` (this is going to use `rollup` to build both CommonJS and ESM versions of the package)
- A `colyseus-arena-hosted-0.14.22.tgz` file is going to be created at the root of this project.
- `package.json`: replace `"@colyseus/arena": "^0.14.xx"` with `"@colyseus/arena": "../path/to/colyseus-arena-hosted-0.14.22.tgz"`


