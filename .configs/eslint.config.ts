import xo from 'xo';
import xoConfigs from './xo.config';

const eslintFlatConfigs = xo.xoToEslintConfig(xoConfigs);

export default eslintFlatConfigs;
