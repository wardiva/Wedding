// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// @remotion/effects (light leak) uses WebGL2; swangle = software WebGL that
// works in headless/GPU-less render environments.
Config.setChromiumOpenGlRenderer("swangle");
