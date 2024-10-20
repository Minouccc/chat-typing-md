import type MarkdownIt from "markdown-it";
import PrismJsComponents from "prismjs/components";

export interface Options {
  codeCopyButtonTitle: string;
  hasSingleTheme: boolean;
}

// 使用正则表达式匹配字符串的第一个字符，并将其转换为大写
function capitalizeFirstLetter(str) {
  return str.replace(/^\w/, (match) => match.toUpperCase());
}

const getBaseLanguageName = (nameOrAlias, components = PrismJsComponents) => {
  const _nameOrAlias = nameOrAlias.toLowerCase();

  const allLanguages = components.languages;
  const allLanguageKeys = Object.keys(allLanguages);

  const lang = {
    value: capitalizeFirstLetter(nameOrAlias || "markdown"),
  };

  for (let index = 0; index < allLanguageKeys.length; index++) {
    const languageKey = allLanguageKeys[index];
    const languageItem = allLanguages[languageKey];

    const { title, alias, aliasTitles } = languageItem;

    if (languageKey === _nameOrAlias) {
      lang.value = title;
      break;
    }

    if (!alias) {
      continue;
    }

    if (Array.isArray(alias)) {
      if (aliasTitles && aliasTitles[_nameOrAlias]) {
        lang.value = aliasTitles[_nameOrAlias];
        break;
      }

      if (alias.includes(_nameOrAlias)) {
        lang.value = title;
        break;
      }
    } else {
      if (alias === _nameOrAlias) {
        lang.value = title;
        break;
      }
    }
  }

  return lang.value;
};

export function getAdaptiveThemeMarker(options: Options) {
  return options.hasSingleTheme ? "" : " xx-adaptive-theme";
}

export function extractTitle(info: string, html = false) {
  if (html) {
    return (
      info.replace(/<!--[^]*?-->/g, "").match(/data-title="(.*?)"/)?.[1] || ""
    );
  }
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || "txt";
}

function extractLang(info: string) {
  return info
    .trim()
    .replace(/=(\d*)/, "")
    .replace(/:(no-)?line-numbers({| |$|=\d*).*/, "")
    .replace(/(-vue|{| ).*$/, "")
    .replace(/^vue-html$/, "template")
    .replace(/^ansi$/, "");
}
