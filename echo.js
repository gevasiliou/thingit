const args = process.argv.slice(2);
//const args = process.argv;

args.forEach(arg => {
  console.log(process.env[arg]);
});
