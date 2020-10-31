# TwitchTOS

## Hacking:
First install the dependencies:
```sh
yarn
```

## Building for the browser:

 - On \*nix:
  ```sh
  NODE_ENV=production yarn build
  ```
   - On Windows with CMD:
  ```bat
  set NODE_ENV=production
  yarn build
  ```
   - On Powershell:
  ```ps1
  $env:NODE_ENV = 'production'
  yarn build
  ```

Then look inside the "build" folder.

## Running the development server:

```sh
yarn watch
```

And then edit the files, they'll be rebuilt upon being changed.
