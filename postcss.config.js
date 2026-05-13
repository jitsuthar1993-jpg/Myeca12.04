import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

const preserveGeneratedNodeSource = () => ({
  postcssPlugin: "myeca-preserve-generated-node-source",
  Once(root) {
    const fallbackSource = root.source;

    if (!fallbackSource?.input?.file) return;

    root.walk((node) => {
      if (!node.source) {
        node.source = fallbackSource;
      }
    });
  },
});

preserveGeneratedNodeSource.postcss = true;

export default {
  plugins: [
    tailwindcss,
    preserveGeneratedNodeSource,
    autoprefixer,
  ],
}
