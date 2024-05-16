let fs = require('fs-extra');

let _Common_ = require('../common/Common.js')

class ManifestManager extends _Common_ {
  constructor() {
    super()

    this.setManifest();

    this.links = {};
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  parseManifest(user, manifest) {
    // TODO отдавать только нужное
    return manifest;
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  hasVersion(version) { return _.isExist(this.manifests[version]); }

  /*****/     /*****/     /*****/     /*****/     /*****/

  setManifest() {
    this.manifests = {};

    let pathManifests = './src/resources/manifests/'

    let paths = fs.readdirSync(pathManifests, 'utf8');

    _.each(paths, (path) => {
      if (path.search('.json') == -1) { return; }
      let name = path.replace('manifest.', '').replace('.json', '')
      let rawdata = fs.readFileSync(`${pathManifests}${path}`);
      this.manifests[name] = JSON.parse(rawdata);
    })
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  get(RTI, user, version, manifest = {}) {
    if (!_.isExist(user))    { let error = InformManager.errorRTI(RTI, `${this.constructor.name}.get.user`,    undefined, new Error('No user in body.'));    return error; }
    if (!_.isExist(version)) { let error = InformManager.errorRTI(RTI, `${this.constructor.name}.get.version`, undefined, new Error('No version in body.')); return error; }

    manifest = this.getManifest(version, manifest);
    manifest = this.parseManifest(user, manifest);

    return manifest;
  }

  getManifest(version, manifest) {
    let result;

    if (!_.isExist(this.manifests[version])) {
      result = this.getLessVersionByLinks(version)

      if (!_.isExist(result)) {
        result = this.getLessVersionByManifest(version)
      }

      version = result;
    }

    return _.extend({}, this.manifests[version], manifest)
  }

  getLessVersionByLinks(version) {
    return this.links[version];
  }

  getLessVersionByManifest(version) {
    let version_spl   = version.split('.').map((_version) => { return Number(_version); })
    let major_version = version_spl[0]
    let minor_version = version_spl[1]
    let fix_version   = version_spl[2]


    let versions = {}
    let versions_all = _.keys(this.manifests);
    for (let i = 0; i < versions_all.length; i++) {
      version_spl = versions_all[i].split('.').map((_version) => { return Number(_version); })
      if (!_.isExist(versions[version_spl[0]]))                                 { versions[version_spl[0]]                                 = {}; }
      if (!_.isExist(versions[version_spl[0]][version_spl[1]]))                 { versions[version_spl[0]][version_spl[1]]                 = {}; }
      if (!_.isExist(versions[version_spl[0]][version_spl[1]][version_spl[2]])) { versions[version_spl[0]][version_spl[1]][version_spl[2]] = true; }
    }


    let minor_version_start;
    let minor_version_max;

    let fix_version_start;
    let fix_version_max;

    for (let _major_version = major_version; _major_version >= 0; _major_version--) {

      if (_major_version == major_version) {
        minor_version_start = minor_version;
      } else {
        if (!_.isExist(versions[_major_version])) { continue; }
        minor_version_max = _.chain(versions[_major_version]).keys().map((i) => Number(i)).max().value();
        minor_version_start = minor_version_max;
      }

      for (let _minor_version = minor_version_start; _minor_version >= 0; _minor_version--) {

        if (_major_version == major_version && _minor_version == minor_version) {
          fix_version_start = fix_version;
        } else {
          if (!_.isExist(versions[_major_version]) || !_.isExist(versions[_major_version][_minor_version])) { continue; }
          fix_version_max = _.chain(versions[_major_version][_minor_version]).keys().map((i) => Number(i)).max().value();
          fix_version_start = fix_version_max;
        }

        for (let _fix_version = fix_version_start; _fix_version >= 0; _fix_version--) {
          let version_new = `${_major_version}.${_minor_version}.${_fix_version}`;
          if (this.hasVersion(version_new)) {
            this.links[version] = version_new
            return version_new;
          }
        }
      }
    }
  }
}

module.exports = new ManifestManager;
