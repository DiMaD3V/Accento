include!("catalog_generated.rs");

impl Language {
    pub fn has_characters(self) -> bool {
        CHARACTER_MAPS.iter().any(|(code, entries)| {
            *code == self.code()
                && entries.iter().any(|(key, lower, upper)| {
                    (!lower.is_empty() && *lower != key.to_string())
                        || (!upper.is_empty() && *upper != key.to_uppercase().to_string())
                })
        })
    }
}

pub fn available_currencies() -> Vec<String> {
    let mut result = Vec::new();
    for (_, symbols) in CURRENCY_MAPS {
        for symbol in *symbols {
            if !result.iter().any(|value| value == symbol) {
                result.push((*symbol).to_owned());
            }
        }
    }
    result
}

/// Unicode text candidates, stable order and no duplicates across selected languages.
/// Digraphs are typed normally; source coverage and optional extensions live in localization/.
pub fn candidates(
    base: char,
    uppercase: bool,
    languages: &[Language],
    selected_currencies: &[String],
) -> Vec<String> {
    let mut result = Vec::new();
    for language in languages {
        if let Some((_, entries)) = CHARACTER_MAPS
            .iter()
            .find(|(code, _)| *code == language.code())
        {
            for &(key, lower, upper) in *entries {
                if key != base {
                    continue;
                }
                let character = if uppercase { upper } else { lower };
                if !character.is_empty()
                    && (uppercase || character != base.to_string())
                    && !result.iter().any(|value| value == character)
                {
                    result.push(character.to_owned());
                }
            }
        }
    }
    // Symbols follow language variants, preserving the usual first selection.
    // Currency symbols have no case and do not depend on the selected languages.
    if let Some((_, symbols)) = CURRENCY_MAPS.iter().find(|(key, _)| *key == base) {
        for symbol in *symbols {
            if selected_currencies.iter().any(|value| value == symbol)
                && !result.iter().any(|value| value == symbol)
            {
                result.push((*symbol).to_owned());
            }
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn only_selected_currencies_are_added_on_every_associated_key() {
        let selected = vec!["€".into(), "₽".into()];
        assert_eq!(
            candidates('e', false, &[Language::Italian], &selected),
            ["è", "é", "€"]
        );
        for uppercase in [false, true] {
            assert_eq!(
                candidates('p', uppercase, &[Language::Italian], &selected),
                ["₽"]
            );
            assert_eq!(
                candidates('r', uppercase, &[Language::Italian], &selected),
                ["₽"]
            );
            assert!(candidates('s', uppercase, &[Language::Italian], &selected).is_empty());
            assert!(candidates('l', uppercase, &[Language::Italian], &selected).is_empty());
        }
    }
    #[test]
    fn every_selectable_language_has_reachable_additional_characters() {
        let source: serde_json::Value =
            serde_json::from_str(include_str!("../../../localization/characters.json")).unwrap();
        for language in Language::ALL {
            let maps = source[language.code()]["maps"].as_object().unwrap();
            let reachable = maps
                .keys()
                .flat_map(|key| {
                    let base = key.chars().next().unwrap();
                    candidates(base, false, &[*language], &[])
                        .into_iter()
                        .chain(candidates(base, true, &[*language], &[]))
                })
                .collect::<Vec<_>>();
            assert_eq!(
                language.has_characters(),
                !reachable.is_empty(),
                "{}",
                language.code()
            );
        }
        assert!(!Language::English.has_characters());
        assert_eq!(
            Language::ALL
                .iter()
                .filter(|language| language.has_characters())
                .count(),
            46
        );
    }
    #[test]
    fn currencies_follow_accents_in_every_language_and_do_not_change_case() {
        assert_eq!(
            candidates('e', false, &[Language::Italian], &available_currencies()),
            ["è", "é", "€"]
        );
        assert_eq!(
            candidates('e', true, &[Language::Italian], &available_currencies()),
            ["È", "É", "€"]
        );
        for language in Language::ALL {
            for uppercase in [false, true] {
                let original = candidates('e', uppercase, &[*language], &[]);
                let extended = candidates('e', uppercase, &[*language], &available_currencies());
                assert!(extended.starts_with(&original), "{}", language.code());
                assert_eq!(extended.iter().filter(|value| *value == "€").count(), 1);
            }
        }
        assert_eq!(
            candidates('l', false, &[Language::Italian], &available_currencies()),
            ["£"]
        );
        assert!(candidates('l', false, &[Language::Italian], &[]).is_empty());
        assert_eq!(
            candidates('y', true, &[Language::Italian], &available_currencies()),
            ["¥"]
        );
    }
    #[test]
    fn currency_data_matches_the_shared_registry_and_combined_lists_have_no_duplicates() {
        let data: std::collections::BTreeMap<String, Vec<String>> =
            serde_json::from_str(include_str!("../../../localization/currencies.json")).unwrap();
        assert_eq!(data.len(), CURRENCY_MAPS.len());
        for &(base, symbols) in CURRENCY_MAPS {
            assert_eq!(data[&base.to_string()], symbols);
            for uppercase in [false, true] {
                let list = candidates(base, uppercase, Language::ALL, &available_currencies());
                for symbol in symbols {
                    assert_eq!(
                        list.iter()
                            .filter(|value| value.as_str() == *symbol)
                            .count(),
                        1
                    );
                }
                let unique: std::collections::HashSet<_> = list.iter().collect();
                assert_eq!(list.len(), unique.len());
            }
        }
    }
    #[test]
    fn combined_sets_preserve_order_without_duplicates() {
        assert_eq!(
            candidates(
                'e',
                false,
                &[Language::Italian, Language::French, Language::Spanish],
                &[]
            ),
            vec!["è", "é", "ê", "ë"]
        );
    }
    #[test]
    fn uppercase_is_one_precomposed_character() {
        assert_eq!(candidates('s', true, &[Language::German], &[]), vec!["ẞ"]);
        assert_eq!(
            candidates('e', true, &[Language::Italian], &[]),
            vec!["È", "É"]
        );
    }
    #[test]
    fn new_sets_have_precomposed_letters_and_stable_codes() {
        for (code, base, lower, upper) in [
            ("sq", 'e', "ë", "Ë"),
            ("sq", 'c', "ç", "Ç"),
            ("pt", 'o', "óòôõ", "ÓÒÔÕ"),
            ("ro", 's', "ș", "Ș"),
            ("pl", 'z', "źż", "ŹŻ"),
            ("tr", 'i', "ı", "Iİ"),
        ] {
            let language = Language::from_code(code).unwrap();
            assert_eq!(language.code(), code);
            assert_eq!(
                candidates(base, false, &[language], &[]),
                lower.chars().map(|c| c.to_string()).collect::<Vec<_>>()
            );
            assert_eq!(
                candidates(base, true, &[language], &[]),
                upper.chars().map(|c| c.to_string()).collect::<Vec<_>>()
            );
        }
    }
    #[test]
    fn every_standard_letter_unit_is_reachable_and_codes_match_registry() {
        let data: serde_json::Value =
            serde_json::from_str(include_str!("../../../localization/characters.json")).unwrap();
        let registry: serde_json::Value =
            serde_json::from_str(include_str!("../../../localization/languages.json")).unwrap();
        assert_eq!(Language::ALL.len(), registry.as_array().unwrap().len());
        for language in Language::ALL {
            assert_eq!(Language::from_code(language.code()), Some(*language));
            let alphabet = data[language.code()]["mainCharacters"].as_array().unwrap();
            for value in alphabet {
                let value = value.as_str().unwrap();
                assert!(!value.is_empty());
                if value.len() == 1 && value.is_ascii() {
                    continue;
                }
                let mut reachable = Vec::new();
                for base in ('a'..='z').chain(std::iter::once('\'')) {
                    reachable.extend(candidates(base, false, &[*language], &[]));
                    reachable.extend(candidates(base, true, &[*language], &[]));
                }
                assert!(
                    reachable.iter().any(|candidate| candidate == value),
                    "{}: {value}",
                    language.code()
                );
            }
        }
    }
    #[test]
    fn native_and_latin_keys_work_for_non_latin_scripts() {
        for (code, base, expected) in [
            ("el", 'α', 'ά'),
            ("ru", 'е', 'ё'),
            ("uk", 'і', 'ї'),
            ("hy", 'a', 'ա'),
            ("ka", 'a', 'ა'),
            ("kk", 'a', 'ә'),
        ] {
            assert!(
                candidates(base, false, &[Language::from_code(code).unwrap()], &[])
                    .contains(&expected.to_string()),
                "{code}"
            );
        }
    }
    #[test]
    fn digraphs_combining_marks_and_uppercase_sequences_are_not_truncated() {
        for (code, base, uppercase, expected) in [
            ("sq", 'd', false, "dh"),
            ("nl", 'i', false, "íj́"),
            ("cnr-Cyrl", 's', false, "с́"),
            ("cnr-Cyrl", 's', true, "С́"),
            ("ru", 'a', false, "а́"),
            ("el", 'i', true, "Ϊ́"),
        ] {
            assert!(
                candidates(base, uppercase, &[Language::from_code(code).unwrap()], &[])
                    .iter()
                    .any(|value| value == expected),
                "{code}: {expected}"
            );
        }
    }
}
