const measurePerformanceAsync = async (label, asyncCode) => {
  let beforeTime = performance.now();
  let result = await asyncCode();
  let afterTime = performance.now();

  console.log(`[Perfomance Measurements](${label}) Completed in ${afterTime - beforeTime} ms.`);

  return result;
};

module.exports.measurePerformanceAsync = measurePerformanceAsync