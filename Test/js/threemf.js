const ThreeMF = (function () {
  function num(v) {
    return String(Math.round(v * 10000) / 10000);
  }

  function esc(s) {
    return String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  }

  function modelXml(parts, title) {
    const out = [];
    out.push('<?xml version="1.0" encoding="UTF-8"?>');
    out.push(
      '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">'
    );
    out.push('<metadata name="Title">' + esc(title) + '</metadata>');
    out.push('<metadata name="Application">Keychain Text Studio</metadata>');
    out.push('<resources>');
    out.push('<basematerials id="1">');
    for (const part of parts) {
      out.push('<base name="' + esc(part.name) + '" displaycolor="' + part.color.toUpperCase() + 'FF"/>');
    }
    out.push('</basematerials>');
    parts.forEach((part, i) => {
      out.push('<object id="' + (i + 2) + '" name="' + esc(part.name) + '" type="model" pid="1" pindex="' + i + '">');
      out.push('<mesh><vertices>');
      const pos = part.positions;
      for (let k = 0; k < pos.length; k += 3) {
        out.push('<vertex x="' + num(pos[k]) + '" y="' + num(pos[k + 1]) + '" z="' + num(pos[k + 2]) + '"/>');
      }
      out.push('</vertices><triangles>');
      const idx = part.indices;
      for (let k = 0; k < idx.length; k += 3) {
        out.push('<triangle v1="' + idx[k] + '" v2="' + idx[k + 1] + '" v3="' + idx[k + 2] + '"/>');
      }
      out.push('</triangles></mesh></object>');
    });
    out.push('</resources><build>');
    parts.forEach((part, i) => out.push('<item objectid="' + (i + 2) + '"/>'));
    out.push('</build></model>');
    return out.join('\n');
  }

  async function build(parts, title) {
    const zip = new JSZip();
    zip.file(
      '[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>' +
        '</Types>'
    );
    zip.file(
      '_rels/.rels',
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Target="/3D/3dmodel.model" Id="rel0" ' +
        'Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>' +
        '</Relationships>'
    );
    zip.file('3D/3dmodel.model', modelXml(parts, title));
    return zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
      compression: 'DEFLATE'
    });
  }

  return { build, modelXml };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ThreeMF;
