import copy from 'rollup-plugin-copy'

const config = [
  {
    input: 'build/index.js',
    output: {
      file: 'lib/index.js',
    },
    plugins: [
      copy({
        targets: [
          { src: 'src/client-sdk-lib/*', dest: 'lib/client-sdk-lib' },
          { src: ['build/*.*'], dest: 'lib' },
          { src: ['build/client-sdk-lib/*.js', 'build/client-sdk-lib/*.d.ts'], dest: 'lib/client-sdk-lib' },
        ]
      })
    ]
  },
];
export default config;