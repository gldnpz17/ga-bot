const logPerformanceAsync = async (label, asyncCode) => {
  let beforeTime = performance.now();
  let result = await asyncCode();
  let afterTime = performance.now();

  console.log(`[Perfomance Measurements](${label}) Completed in ${afterTime - beforeTime} ms.`);

  return result;
};

const measurePerformanceAsync = async (asyncCode) => {
  let beforeTime = performance.now();
  let result = await asyncCode();
  let afterTime = performance.now();

  return {
    result: result,
    timeMillis: afterTime - beforeTime
  };
};

module.exports.logPerformanceAsync = logPerformanceAsync
module.exports.measurePerformanceAsync = measurePerformanceAsync