/**
 * builtinExtensions.ts
 * 
 * Built-in extension functions that are always available in Formplayer.
 * These provide core functionality for dynamic choice lists and other features.
 */

// Extend window interface to include getObservationsByQuery if not already defined
declare global {
  interface Window {
    formulus?: {
      getObservationsByQuery?(options: {
        formType: string;
        isDraft?: boolean;
        includeDeleted?: boolean;
        whereClause?: string | null;
      }): Promise<any[]>;
    };
  }
}

/**
 * Get dynamic choice list by querying local observations.
 * 
 * This function queries the native Formulus database via the WebView bridge,
 * then filters and formats the results based on the provided configuration.
 * 
 * @param queryName - Name of the query (typically a form type like 'household')
 * @param params - Query parameters including:
 *   - _config.valueField: Path to extract value (e.g., 'data.hh_village_name')
 *   - _config.labelField: Path to extract label (default: same as valueField)
 *   - _config.distinct: Whether to return unique values only
 *   - _config.distinctField: Field to use for uniqueness check
 *   - where: SQL-like WHERE clause for filtering (e.g., "data.hh_village = 'kopria'")
 * @param formData - Current form data (for template resolution in WHERE clauses)
 * @returns Array of choice items with {const, title} format
 */
export async function getDynamicChoiceList(
  queryName: string,
  params: Record<string, any> = {},
  formData: Record<string, any> = {},
): Promise<Array<{ const: any; title: string }>> {
  // Check if Formulus bridge is available
  if (!window.formulus?.getObservationsByQuery) {
    console.error('getDynamicChoiceList: getObservationsByQuery not available');
    return [];
  }

  try {
    // Extract configuration
    const config = params._config || {};
    const valueField = config.valueField || 'observationId';
    const labelField = config.labelField || valueField;
    const distinct = config.distinct || false;
    
    // Build WHERE clause from params (excluding _config)
    let whereClause = params.where || null;
    
    // If no explicit WHERE clause, build one from filter params
    if (!whereClause) {
      const filterParams = Object.entries(params)
        .filter(([key]) => key !== '_config' && key !== 'where');
      
      if (filterParams.length > 0) {
        // Check if any filter values are null/undefined/empty - if so, return empty result
        const hasEmptyValue = filterParams.some(([_, value]) => 
          value === null || value === undefined || value === ''
        );
        
        if (hasEmptyValue) {
          // Return empty choices when dependency values are not yet selected
          return [];
        }
        
        const conditions = filterParams.map(([fieldPath, value]) => {
          // Escape single quotes in values
          const escapedValue = String(value).replace(/'/g, "''");
          return `data.${fieldPath} = '${escapedValue}'`;
        }).join(' AND ');
        
        whereClause = conditions;
      }
    }

    // Query observations via bridge
    const observations = await window.formulus.getObservationsByQuery({
      formType: queryName,
      isDraft: false,
      includeDeleted: false,
      whereClause: whereClause,
    });

    // Helper to extract nested value from object path (e.g., 'data.hh_village_name')
    const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Map observations to choice items
    let choices = observations.map((obs: any) => {
      const value = getNestedValue(obs, valueField);
      const label = getNestedValue(obs, labelField);
      return {
        const: value,
        title: label || String(value),
      };
    });

    // Filter out null/undefined values
    choices = choices.filter(choice => choice.const != null && choice.const !== '');

    // Apply distinct if requested
    if (distinct) {
      const seen = new Set();
      choices = choices.filter(choice => {
        const key = String(choice.const);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    if (choices.length === 0) {
      console.warn(`getDynamicChoiceList: No valid choices found for query '${queryName}'`);
    }

    return choices;
  } catch (error) {
    console.error('getDynamicChoiceList error:', error);
    return [];
  }
}

/**
 * Get all built-in extension functions as a Map
 * @returns Map of function name to function
 */
export function getBuiltinExtensions(): Map<string, Function> {
  const functions = new Map<string, Function>();
  functions.set('getDynamicChoiceList', getDynamicChoiceList);
  return functions;
}
