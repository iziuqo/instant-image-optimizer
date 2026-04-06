# Contributing

Thanks for your interest in contributing.

## Scope

This repo currently ships a browser-based demo app in `vanilla/`. The goal is to evolve the internals into a reusable library.

## Development setup

Serve the repo with any static server (ES Modules require http/https):

```bash
python -m http.server 5173
```

Open:

- http://localhost:5173/vanilla/

## Guidelines

- Keep code **vanilla** (no frameworks) unless discussed.
- Prefer small, focused PRs.
- Keep performance in mind (large images, mobile).
- Maintain the modular structure under `vanilla/utils` and `vanilla/components`.

## Proposing changes

- Open an issue describing:
  - the user-facing behavior
  - expected performance impact
  - browser support considerations

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
