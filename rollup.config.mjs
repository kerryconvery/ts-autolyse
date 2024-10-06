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
          { src: 'src/types.ts*', dest: 'lib/client-sdk-lib' },
          { src: ['build/*.js', 'build/index.d.ts', 'build/client-sdk-lib/types.js'], dest: 'lib' },
        ]
      })
    ]
  },
];
export default config;