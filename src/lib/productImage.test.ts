import { runProductImageSelfCheck } from './productImage.validation'
import { runBrandNormalizationSelfCheck } from './brand.test'
import { runCategoryNormalizationSelfCheck } from './category.test'
import { runExcludedProductsSelfCheck } from '../services/products.test'

// Executa verificação abrangente de todas as linhas de produto (incluindo Korax R6 Multiuso, Chuveiro, Limpador Parabrisa, etc.)
runProductImageSelfCheck()
runBrandNormalizationSelfCheck()
runCategoryNormalizationSelfCheck()
runExcludedProductsSelfCheck()
