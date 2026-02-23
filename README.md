# UI Toolkit React

![CodeQL](https://img.shields.io/github/actions/workflow/status/device-management-toolkit/ui-toolkit-react/codeql-analysis.yml?style=for-the-badge&label=CodeQL&logo=github)
![Build](https://img.shields.io/github/actions/workflow/status/device-management-toolkit/ui-toolkit-react/ci.yml?style=for-the-badge&logo=github)
![Codecov](https://img.shields.io/codecov/c/github/device-management-toolkit/ui-toolkit-react?style=for-the-badge&logo=codecov)
[![OSSF-Scorecard Score](https://img.shields.io/ossf-scorecard/github.com/device-management-toolkit/ui-toolkit-react?style=for-the-badge&label=OSSF%20Score)](https://api.securityscorecards.dev/projects/github.com/open-amt-cloud-toolkit/ui-toolkir-react)
[![Discord](https://img.shields.io/discord/1063200098680582154?style=for-the-badge&label=Discord&logo=discord&logoColor=white&labelColor=%235865F2&link=https%3A%2F%2Fdiscord.gg%2FDKHeUNEWVH)](https://discord.gg/DKHeUNEWVH)

> Disclaimer: Production viable releases are tagged and listed under 'Releases'. All other check-ins should be considered 'in-development' and should not be used in production

> IMPORTANT: For now, we are continuing to publish both @device-management-toolkit/ui-toolkit-react and @open-amt-cloud-toolkit/ui-toolkit-react npm packages to avoid a breaking change. Please update your package.json at your earliest convenience for when we cease to publish @open-amt-cloud-toolkit/ui-toolkit-react. This is in effort to support the renaming of the toolkit.

The UI Toolkit provides prebuilt, React-based components for integrating remote management features such as a keyboard, video, mouse (KVM) control into a web-based management console UI. The controls have a reference UI and layout that can be customized further to seamlessly integrate with existing management console solutions.

**For detailed documentation** about [Getting Started with the UI Toolkit](https://device-management-toolkit.github.io/docs/2.0/Tutorials/uitoolkit) or other features of the Device Management Toolkit, see the [docs](https://device-management-toolkit.github.io/docs/).

## Prerequisites

To succesfully deploy the UI Toolkit using React, the following software must be installed on your development system:

- [Node.js\* LTS 18.x.x or newer](https://nodejs.org/en/)
- [git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/) or any other IDE of choice

## NPM Install command

```bash
# Install UI Toolkit
npm install @device-management-toolkit/ui-toolkit-react
```

### Run the Example

This example is created using the following command:

```bash
# Create a new React app with Vite
npm create vite@latest my-app -- --template react-ts
```

For quick testing, an example app is included. This requires a deployed MPS/RPS instance and an AMT device connected to it.

```bash
cd example
npm install
npm run dev
```

## Development

To build and develop the library locally:

```bash
# Clone the repository
git clone https://github.com/device-management-toolkit/ui-toolkit-react.git
cd ui-toolkit-react

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Build the library
npm run build
```

## Additional Resources

- For detailed documentation and Getting Started, [visit the docs site](https://device-management-toolkit.github.io/docs).

- Looking to contribute? [Find more information here about contribution guidelines and practices](./CONTRIBUTING.md).

- Find a bug? Or have ideas for new features? [Open a new Issue](https://github.com/device-management-toolkit/ui-toolkit-react/issues).

- Need additional support or want to get the latest news and events about Open AMT? Connect with the team directly through Discord.

  [![Discord Banner 1](https://discordapp.com/api/guilds/1063200098680582154/widget.png?style=banner2)](https://discord.gg/DKHeUNEWVH)

## License Note

If you are distributing the FortAwesome Icons, please provide attribution to the source per the [CC-by 4.0](https://creativecommons.org/licenses/by/4.0/deed.ast) license obligations.
