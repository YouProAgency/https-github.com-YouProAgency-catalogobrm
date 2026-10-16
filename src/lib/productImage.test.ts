import { runProductImageSelfCheck } from './productImage.validation'
import { runBrandNormalizationSelfCheck } from './brand.test'
import { runCategoryNormalizationSelfCheck } from './category.test'

// Executa verificação abrangente de Kobra 1, Kobra 2 e casos de borda
runProductImageSelfCheck()
runBrandNormalizationSelfCheck()
runCategoryNormalizationSelfCheck()
